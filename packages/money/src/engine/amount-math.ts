import type { CurrencyUnit } from "../currency/currency-unit.js";
import { ArithmeticError } from "../errors/index.js";
import {
  Decimal,
  MoneyDecimal,
  type MoneyDecimalInstance,
} from "./decimal.js";
import {
  parsedToDecimal,
  parsedToMinorUnits,
  parseAmountString,
} from "./parse.js";
import {
  BIGINT_MAX_DIGITS,
  type AmountRepresentation,
  type AmountStorage,
} from "./storage.js";

function digitCount(value: bigint): number {
  const abs = value < 0n ? -value : value;
  return abs.toString().length;
}

function canStayBigInt(minorUnits: bigint, scale: number): boolean {
  if (scale < 0) return false;
  return digitCount(minorUnits) <= BIGINT_MAX_DIGITS;
}

export function storageToDecimal(storage: AmountStorage): MoneyDecimalInstance {
  if (storage.representation === "decimal") {
    return storage.value;
  }
  const scale = storage.scale;
  const negative = storage.minorUnits < 0n;
  const abs = negative ? -storage.minorUnits : storage.minorUnits;
  const raw = abs.toString().padStart(scale + 1, "0");
  const whole = scale === 0 ? raw : raw.slice(0, -scale) || "0";
  const frac = scale === 0 ? "" : raw.slice(-scale);
  const text = frac ? `${negative ? "-" : ""}${whole}.${frac}` : `${negative ? "-" : ""}${whole}`;
  return new MoneyDecimal(text);
}

export function decimalToString(value: MoneyDecimalInstance): string {
  // Avoid exponential form for money strings.
  return value.toFixed();
}

export function createStorageFromString(
  amount: string,
  currency: CurrencyUnit,
): AmountStorage {
  const parsed = parseAmountString(amount);
  const digits = currency.defaultFractionDigits;

  if (digits < 0 || parsed.scale > digits) {
    return { representation: "decimal", value: parsedToDecimal(parsed) };
  }

  const minorUnits = parsedToMinorUnits(parsed, digits);
  if (!canStayBigInt(minorUnits, digits)) {
    return { representation: "decimal", value: parsedToDecimal(parsed) };
  }

  return { representation: "bigint", minorUnits, scale: digits };
}

export function createStorageFromMinor(
  minorUnits: bigint,
  currency: CurrencyUnit,
): AmountStorage {
  const digits = currency.defaultFractionDigits;
  if (digits < 0) {
    throw new ArithmeticError(
      `Currency ${currency.currencyCode} has no fixed minor units`,
    );
  }
  if (!canStayBigInt(minorUnits, digits)) {
    return {
      representation: "decimal",
      value: storageToDecimal({
        representation: "bigint",
        minorUnits,
        scale: digits,
      }),
    };
  }
  return { representation: "bigint", minorUnits, scale: digits };
}

export function createZeroStorage(currency: CurrencyUnit): AmountStorage {
  const digits = currency.defaultFractionDigits;
  if (digits < 0) {
    return { representation: "decimal", value: new MoneyDecimal(0) };
  }
  return { representation: "bigint", minorUnits: 0n, scale: digits };
}

export function maybeDemote(
  storage: AmountStorage,
  currency: CurrencyUnit,
): AmountStorage {
  const digits = currency.defaultFractionDigits;
  if (digits < 0 || storage.representation === "bigint") {
    return storage;
  }

  const value = storage.value;
  if (value.decimalPlaces() > digits) {
    return storage;
  }

  const scaled = value.mul(tenPowNumber(digits));
  if (!scaled.isInteger()) {
    return storage;
  }

  const minorUnits = BigInt(scaled.toFixed(0));
  if (!canStayBigInt(minorUnits, digits)) {
    return storage;
  }

  return { representation: "bigint", minorUnits, scale: digits };
}

function tenPowNumber(n: number): MoneyDecimalInstance {
  return new MoneyDecimal(10).pow(n);
}

export function addStorage(
  left: AmountStorage,
  right: AmountStorage,
): AmountStorage {
  if (
    left.representation === "bigint" &&
    right.representation === "bigint" &&
    left.scale === right.scale
  ) {
    const minorUnits = left.minorUnits + right.minorUnits;
    if (canStayBigInt(minorUnits, left.scale)) {
      return { representation: "bigint", minorUnits, scale: left.scale };
    }
  }
  return {
    representation: "decimal",
    value: storageToDecimal(left).plus(storageToDecimal(right)),
  };
}

export function subtractStorage(
  left: AmountStorage,
  right: AmountStorage,
): AmountStorage {
  if (
    left.representation === "bigint" &&
    right.representation === "bigint" &&
    left.scale === right.scale
  ) {
    const minorUnits = left.minorUnits - right.minorUnits;
    if (canStayBigInt(minorUnits, left.scale)) {
      return { representation: "bigint", minorUnits, scale: left.scale };
    }
  }
  return {
    representation: "decimal",
    value: storageToDecimal(left).minus(storageToDecimal(right)),
  };
}

export function multiplyStorage(
  storage: AmountStorage,
  multiplicand: string | number | bigint,
): AmountStorage {
  const factor = toDecimalFactor(multiplicand);

  if (storage.representation === "bigint" && factor.isInteger()) {
    const minorUnits = storage.minorUnits * BigInt(factor.toFixed(0));
    if (canStayBigInt(minorUnits, storage.scale)) {
      return {
        representation: "bigint",
        minorUnits,
        scale: storage.scale,
      };
    }
  }

  return {
    representation: "decimal",
    value: storageToDecimal(storage).mul(factor),
  };
}

export function divideStorage(
  storage: AmountStorage,
  divisor: string | number | bigint,
): AmountStorage {
  const factor = toDecimalFactor(divisor);
  if (factor.isZero()) {
    throw new ArithmeticError("Division by zero");
  }

  // Exact integer division on bigint path when remainder is zero.
  if (storage.representation === "bigint" && factor.isInteger()) {
    const d = BigInt(factor.toFixed(0));
    if (d !== 0n && storage.minorUnits % d === 0n) {
      const minorUnits = storage.minorUnits / d;
      if (canStayBigInt(minorUnits, storage.scale)) {
        return {
          representation: "bigint",
          minorUnits,
          scale: storage.scale,
        };
      }
    }
  }

  return {
    representation: "decimal",
    value: storageToDecimal(storage).div(factor),
  };
}

export function remainderStorage(
  storage: AmountStorage,
  divisor: string | number | bigint,
): AmountStorage {
  const factor = toDecimalFactor(divisor);
  if (factor.isZero()) {
    throw new ArithmeticError("Division by zero");
  }

  if (storage.representation === "bigint" && factor.isInteger()) {
    const d = BigInt(factor.toFixed(0));
    const minorUnits = storage.minorUnits % d;
    return {
      representation: "bigint",
      minorUnits,
      scale: storage.scale,
    };
  }

  return {
    representation: "decimal",
    value: storageToDecimal(storage).mod(factor),
  };
}

export function negateStorage(storage: AmountStorage): AmountStorage {
  if (storage.representation === "bigint") {
    return {
      representation: "bigint",
      minorUnits: -storage.minorUnits,
      scale: storage.scale,
    };
  }
  return { representation: "decimal", value: storage.value.neg() };
}

export function absStorage(storage: AmountStorage): AmountStorage {
  if (storage.representation === "bigint") {
    return {
      representation: "bigint",
      minorUnits:
        storage.minorUnits < 0n ? -storage.minorUnits : storage.minorUnits,
      scale: storage.scale,
    };
  }
  return { representation: "decimal", value: storage.value.abs() };
}

export function compareStorage(
  left: AmountStorage,
  right: AmountStorage,
): number {
  if (
    left.representation === "bigint" &&
    right.representation === "bigint" &&
    left.scale === right.scale
  ) {
    if (left.minorUnits < right.minorUnits) return -1;
    if (left.minorUnits > right.minorUnits) return 1;
    return 0;
  }
  return storageToDecimal(left).cmp(storageToDecimal(right));
}

export function storageToPlainString(storage: AmountStorage): string {
  if (storage.representation === "decimal") {
    return decimalToString(storage.value);
  }
  return decimalToString(storageToDecimal(storage));
}

export function getRepresentation(
  storage: AmountStorage,
): AmountRepresentation {
  return storage.representation;
}

export function scaleOf(storage: AmountStorage): number {
  if (storage.representation === "bigint") {
    return storage.scale;
  }
  return Math.max(storage.value.decimalPlaces(), 0);
}

export function precisionOf(storage: AmountStorage): number {
  if (storage.representation === "bigint") {
    return digitCount(storage.minorUnits);
  }
  return storage.value.precision();
}

function toDecimalFactor(
  value: string | number | bigint,
): MoneyDecimalInstance {
  if (typeof value === "bigint") {
    return new MoneyDecimal(value.toString());
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ArithmeticError("Factor must be a finite number");
    }
    return new MoneyDecimal(value);
  }
  return new MoneyDecimal(value.trim());
}

export function roundStorage(
  storage: AmountStorage,
  scale: number,
  mode: Decimal.Rounding,
): AmountStorage {
  const rounded = storageToDecimal(storage).toDecimalPlaces(scale, mode);
  return { representation: "decimal", value: rounded };
}
