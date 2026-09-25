import { MoneyDecimal } from "../engine/decimal.js";
import { resolveCurrency } from "../currency/registry.js";
import type { CurrencyUnit } from "../currency/currency-unit.js";
import { Money } from "../amount/money.js";
import { MoneyError } from "../errors/index.js";
import type { RoundingMode } from "../rounding/modes.js";
import {
  Conversion,
  exchangeRate,
  rateAsOfInstant,
  type ExchangeRate,
} from "./conversion.js";

export class MissingFxRateError extends MoneyError {
  readonly base: string;
  readonly term: string;
  readonly asOf: string;

  constructor(base: string, term: string, asOf: string) {
    super(`No FX rate for ${base}/${term} on or before ${asOf}`);
    this.name = "MissingFxRateError";
    this.base = base;
    this.term = term;
    this.asOf = asOf;
  }
}

/** Invert quote-per-base factor (USD→IDR becomes IDR→USD). */
export function invertFactor(rate: ExchangeRate): ExchangeRate {
  const inverted = new MoneyDecimal("1").div(rate.factor).toFixed();
  return exchangeRate({
    base: rate.term,
    term: rate.base,
    factor: inverted,
    asOf: rateAsOfInstant(rate),
  });
}

/**
 * Latest rate on or before `asOf` (ISO instant strings compared lexicographically when UTC Z).
 */
export function pickRate(
  rates: readonly ExchangeRate[],
  base: string | CurrencyUnit,
  term: string | CurrencyUnit,
  asOf: string,
): ExchangeRate {
  const baseCode = resolveCurrency(base).currencyCode;
  const termCode = resolveCurrency(term).currencyCode;
  let best: ExchangeRate | undefined;
  let bestAsOf = "";
  for (const rate of rates) {
    if (rate.base.currencyCode !== baseCode || rate.term.currencyCode !== termCode) {
      continue;
    }
    const instant = rateAsOfInstant(rate);
    if (!instant || instant > asOf) {
      continue;
    }
    if (!best || instant > bestAsOf) {
      best = rate;
      bestAsOf = instant;
    }
  }
  if (!best) {
    throw new MissingFxRateError(baseCode, termCode, asOf);
  }
  return best;
}

/** Convert using the best rate on or before `asOf`. */
export function convertAt(
  amount: Money,
  term: string | CurrencyUnit,
  asOf: string,
  rates: readonly ExchangeRate[],
  roundingMode: RoundingMode = "HALF_EVEN",
): Money {
  const termUnit = resolveCurrency(term);
  if (amount.currency.currencyCode === termUnit.currencyCode) {
    return amount;
  }
  const rate = pickRate(
    rates,
    amount.currency,
    termUnit,
    asOf,
  );
  return amount.with(Conversion.of(rate, roundingMode));
}

/**
 * Pivot through `via` when no direct pair exists (e.g. EUR→USD then USD→GBP).
 */
export function convertAtViaPivot(
  amount: Money,
  term: string | CurrencyUnit,
  via: string | CurrencyUnit,
  asOf: string,
  rates: readonly ExchangeRate[],
  roundingMode: RoundingMode = "HALF_EVEN",
): Money {
  const termUnit = resolveCurrency(term);
  if (amount.currency.currencyCode === termUnit.currencyCode) {
    return amount;
  }
  try {
    return convertAt(amount, termUnit, asOf, rates, roundingMode);
  } catch (error) {
    if (!(error instanceof MissingFxRateError)) {
      throw error;
    }
  }
  const viaUnit = resolveCurrency(via);
  if (
    amount.currency.currencyCode === viaUnit.currencyCode ||
    termUnit.currencyCode === viaUnit.currencyCode
  ) {
    throw new MissingFxRateError(
      amount.currency.currencyCode,
      termUnit.currencyCode,
      asOf,
    );
  }
  const leg1 = convertAt(amount, viaUnit, asOf, rates, roundingMode);
  return convertAt(leg1, termUnit, asOf, rates, roundingMode);
}
