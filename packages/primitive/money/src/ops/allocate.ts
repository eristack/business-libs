import { ArithmeticError } from "../errors/index.js";
import {
  createStorageFromMinor,
  maybeDemote,
  roundStorage,
  storageToDecimal,
} from "../engine/amount-math.js";
import { MoneyDecimal } from "../engine/decimal.js";
import { toDecimalRounding } from "../rounding/modes.js";
import type { CurrencyUnit } from "../currency/currency-unit.js";
import type { AmountStorage } from "../engine/storage.js";

/**
 * Largest-remainder allocation in currency minor units.
 * Returns minor-unit bigints that sum to the rounded total.
 */
export function allocateMinorUnits(
  storage: AmountStorage,
  currency: CurrencyUnit,
  ratios: readonly number[],
): bigint[] {
  if (ratios.length === 0) {
    throw new ArithmeticError("Allocation requires at least one ratio");
  }
  if (ratios.some((r) => !Number.isFinite(r) || r < 0)) {
    throw new ArithmeticError("Allocation ratios must be finite and non-negative");
  }
  const totalRatio = ratios.reduce((a, b) => a + b, 0);
  if (totalRatio <= 0) {
    throw new ArithmeticError("Sum of allocation ratios must be positive");
  }

  const digits = currency.defaultFractionDigits;
  if (digits < 0) {
    throw new ArithmeticError(
      `Cannot allocate for currency ${currency.currencyCode} without fixed fraction digits`,
    );
  }

  const rounded = maybeDemote(
    roundStorage(storage, digits, toDecimalRounding("HALF_EVEN")),
    currency,
  );

  let totalMinor: bigint;
  if (rounded.representation === "bigint") {
    totalMinor = rounded.minorUnits;
  } else {
    const scaled = storageToDecimal(rounded).mul(new MoneyDecimal(10).pow(digits));
    totalMinor = BigInt(scaled.toFixed(0));
  }

  const rawShares = ratios.map((ratio) => {
    const share = new MoneyDecimal(totalMinor.toString())
      .mul(ratio)
      .div(totalRatio);
    const whole = share.toDecimalPlaces(0, MoneyDecimal.ROUND_DOWN);
    const fraction = share.minus(whole);
    return {
      whole: BigInt(whole.toFixed(0)),
      fraction: fraction.toNumber(),
    };
  });

  let sumWhole = rawShares.reduce((acc, s) => acc + s.whole, 0n);
  let remainder = totalMinor - sumWhole;

  const order = rawShares
    .map((s, index) => ({ index, fraction: s.fraction }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = rawShares.map((s) => s.whole);
  let i = 0;
  while (remainder > 0n) {
    const slot = order[i % order.length];
    if (!slot) break;
    const current = result[slot.index] ?? 0n;
    result[slot.index] = current + 1n;
    remainder -= 1n;
    i += 1;
  }
  while (remainder < 0n) {
    const slot = order[i % order.length];
    if (!slot) break;
    const current = result[slot.index] ?? 0n;
    result[slot.index] = current - 1n;
    remainder += 1n;
    i += 1;
  }

  return result;
}

export function minorUnitsToStorage(
  minor: bigint,
  currency: CurrencyUnit,
): AmountStorage {
  return createStorageFromMinor(minor, currency);
}
