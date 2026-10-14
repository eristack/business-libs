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

/** App-supplied FX period master row (wall dates, quote-per-base string). */
export type WallPeriodQuoteRate = {
  base: string | CurrencyUnit;
  term: string | CurrencyUnit;
  /** Inclusive YYYY-MM-DD wall start. */
  effectiveFrom: string;
  /** Inclusive YYYY-MM-DD wall end. */
  effectiveTo: string;
  /** Quote currency amount per one unit of base — same shape as `convertAtQuotePerBase`. */
  quotePerBase: string;
};

export class MissingWallPeriodFxRateError extends MoneyError {
  readonly base: string;
  readonly term: string;
  readonly asOfWall: string;

  constructor(base: string, term: string, asOfWall: string) {
    super(`No FX period for ${base}/${term} on wall date ${asOfWall}`);
    this.name = "MissingWallPeriodFxRateError";
    this.base = base;
    this.term = term;
    this.asOfWall = asOfWall;
  }
}

function normalizeWallDate(value: string, field: string): string {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new MoneyError(`${field} must be YYYY-MM-DD`);
  }
  return trimmed;
}

/**
 * Resolve quote-per-base for a wall calendar day from app-owned period rows (cost-sheet order date).
 * Does not convert — pair with `convertAtQuotePerBase`.
 */
export function resolveQuotePerBaseForWallDate(
  base: string | CurrencyUnit,
  term: string | CurrencyUnit,
  asOfWall: string,
  periods: readonly WallPeriodQuoteRate[],
): string {
  const baseCode = resolveCurrency(base).currencyCode;
  const termCode = resolveCurrency(term).currencyCode;
  const wall = normalizeWallDate(asOfWall, "asOfWall");

  let match: WallPeriodQuoteRate | undefined;
  for (const row of periods) {
    if (
      resolveCurrency(row.base).currencyCode !== baseCode ||
      resolveCurrency(row.term).currencyCode !== termCode
    ) {
      continue;
    }
    const from = normalizeWallDate(row.effectiveFrom, "effectiveFrom");
    const to = normalizeWallDate(row.effectiveTo, "effectiveTo");
    if (from > to) {
      throw new MoneyError(`FX period ${baseCode}/${termCode} has effectiveFrom after effectiveTo`);
    }
    if (wall >= from && wall <= to) {
      if (match) {
        throw new MoneyError(
          `Multiple FX periods match ${baseCode}/${termCode} on ${wall} — periods must not overlap`,
        );
      }
      match = row;
    }
  }

  if (!match) {
    throw new MissingWallPeriodFxRateError(baseCode, termCode, wall);
  }

  return match.quotePerBase.trim();
}

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
