import { Money } from "../amount/money.js";
import type { MonetaryAmount } from "../amount/monetary-amount.js";
import type { CurrencyUnit } from "../currency/currency-unit.js";
import { resolveCurrency } from "../currency/registry.js";
import { ArithmeticError } from "../errors/index.js";
import type { MonetaryOperator } from "../ops/types.js";
import type { RoundingMode } from "../rounding/modes.js";
import { Rounding } from "../rounding/rounding.js";

export interface ExchangeRate {
  readonly base: CurrencyUnit;
  readonly term: CurrencyUnit;
  /** Multiply base amount by factor to get term amount. */
  readonly factor: string;
  /** ISO-8601 UTC instant when this rate was quoted (wire-safe). */
  readonly asOf?: string;
  /** @deprecated Prefer `asOf` (ISO string). */
  readonly timestamp?: Date;
}

export interface ExchangeRateInput {
  base: string | CurrencyUnit;
  term: string | CurrencyUnit;
  factor: string | number;
  /** ISO-8601 UTC instant when this rate was quoted. */
  asOf?: string;
  /** @deprecated Prefer `asOf`. */
  timestamp?: Date;
}

export function rateAsOfInstant(rate: ExchangeRate): string | undefined {
  return rate.asOf ?? rate.timestamp?.toISOString();
}

/** True when `asOf` is missing or older than `maxAgeMs` relative to `now`. */
export function isExchangeRateStale(
  rate: ExchangeRate,
  options: { maxAgeMs: number; now?: string | Date },
): boolean {
  const asOf = rateAsOfInstant(rate);
  if (!asOf) return true;
  const nowMs =
    options.now instanceof Date
      ? options.now.getTime()
      : Date.parse(String(options.now ?? new Date().toISOString()));
  const asOfMs = Date.parse(asOf);
  if (!Number.isFinite(asOfMs) || !Number.isFinite(nowMs)) return true;
  return nowMs - asOfMs > options.maxAgeMs;
}

export function exchangeRate(input: ExchangeRateInput): ExchangeRate {
  const factor =
    typeof input.factor === "number" ? String(input.factor) : input.factor;
  const asDecimal = Number(factor);
  if (!factor.trim() || !Number.isFinite(asDecimal) || asDecimal <= 0) {
    throw new ArithmeticError("Exchange rate factor must be a positive finite value");
  }
  const asOf = input.asOf ?? input.timestamp?.toISOString();
  return {
    base: resolveCurrency(input.base),
    term: resolveCurrency(input.term),
    factor: factor.trim(),
    asOf,
    timestamp: input.timestamp,
  };
}

function isExchangeRate(value: ExchangeRate | ExchangeRateInput): value is ExchangeRate {
  return (
    typeof value.base === "object" &&
    value.base !== null &&
    "currencyCode" in value.base &&
    typeof value.term === "object" &&
    value.term !== null &&
    "currencyCode" in value.term &&
    typeof value.factor === "string"
  );
}

export class CurrencyConversion implements MonetaryOperator {
  readonly rate: ExchangeRate;
  readonly roundingMode: RoundingMode;

  constructor(rate: ExchangeRate, roundingMode: RoundingMode = "HALF_EVEN") {
    this.rate = rate;
    this.roundingMode = roundingMode;
  }

  apply(amount: MonetaryAmount): Money {
    if (!(amount instanceof Money)) {
      throw new ArithmeticError("Conversion requires a Money instance");
    }
    if (amount.currency.currencyCode !== this.rate.base.currencyCode) {
      throw new ArithmeticError(
        `Conversion expects ${this.rate.base.currencyCode} but got ${amount.currency.currencyCode}`,
      );
    }
    if (this.rate.base.currencyCode === this.rate.term.currencyCode) {
      return amount;
    }

    const converted = Money.of(
      amount.multiply(this.rate.factor).amountString(),
      this.rate.term,
    );
    const digits = this.rate.term.defaultFractionDigits;
    if (digits < 0) {
      return converted;
    }
    return converted.with(Rounding.of(digits, this.roundingMode));
  }
}

export function convertAtQuotePerBase(
  amount: Money,
  quotePerBase: string,
  quote: string | CurrencyUnit,
  roundingMode: RoundingMode = "HALF_EVEN",
): Money {
  if (typeof quotePerBase === "number") {
    throw new ArithmeticError("quotePerBase must be a string, not a JS number");
  }
  return amount.with(
    Conversion.of(
      {
        base: amount.currency,
        term: quote,
        factor: quotePerBase,
      },
      roundingMode,
    ),
  );
}

export const Conversion = {
  of(
    rate: ExchangeRate | ExchangeRateInput,
    roundingMode: RoundingMode = "HALF_EVEN",
  ): CurrencyConversion {
    const finalRate = isExchangeRate(rate) ? rate : exchangeRate(rate);
    return new CurrencyConversion(finalRate, roundingMode);
  },
};
