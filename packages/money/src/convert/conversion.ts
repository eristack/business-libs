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
  readonly timestamp?: Date;
}

export interface ExchangeRateInput {
  base: string | CurrencyUnit;
  term: string | CurrencyUnit;
  factor: string | number;
  timestamp?: Date;
}

export function exchangeRate(input: ExchangeRateInput): ExchangeRate {
  const factor =
    typeof input.factor === "number" ? String(input.factor) : input.factor;
  const asDecimal = Number(factor);
  if (!factor.trim() || !Number.isFinite(asDecimal) || asDecimal <= 0) {
    throw new ArithmeticError("Exchange rate factor must be a positive finite value");
  }
  return {
    base: resolveCurrency(input.base),
    term: resolveCurrency(input.term),
    factor: factor.trim(),
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

export const Conversion = {
  of(
    rate: ExchangeRate | ExchangeRateInput,
    roundingMode: RoundingMode = "HALF_EVEN",
  ): CurrencyConversion {
    const finalRate = isExchangeRate(rate) ? rate : exchangeRate(rate);
    return new CurrencyConversion(finalRate, roundingMode);
  },
};
