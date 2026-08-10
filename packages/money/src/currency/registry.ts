import { UnknownCurrencyError } from "../errors/index.js";
import {
  DefaultCurrencyUnit,
  type CurrencyUnit,
  type CurrencyUnitData,
} from "./currency-unit.js";
import { ISO_4217 } from "./iso-data.js";

const byCode = new Map<string, CurrencyUnit>();

for (const row of ISO_4217) {
  byCode.set(row.currencyCode, new DefaultCurrencyUnit(row));
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getCurrency(currencyCode: string): CurrencyUnit {
  const code = normalizeCode(currencyCode);
  const found = byCode.get(code);
  if (!found) {
    throw new UnknownCurrencyError(code);
  }
  return found;
}

export function tryGetCurrency(currencyCode: string): CurrencyUnit | undefined {
  return byCode.get(normalizeCode(currencyCode));
}

export function getCurrencies(): CurrencyUnit[] {
  return [...byCode.values()].sort((a, b) =>
    a.currencyCode.localeCompare(b.currencyCode),
  );
}

export function isCurrencyAvailable(currencyCode: string): boolean {
  return byCode.has(normalizeCode(currencyCode));
}

/**
 * Register or replace a currency unit (custom units, points, crypto, etc.).
 * Returns the previous unit if one existed under the same code.
 */
export function registerCurrency(data: CurrencyUnitData): CurrencyUnit | undefined {
  const code = normalizeCode(data.currencyCode);
  const previous = byCode.get(code);
  const unit = new DefaultCurrencyUnit({
    currencyCode: code,
    numericCode: data.numericCode,
    defaultFractionDigits: data.defaultFractionDigits,
  });
  byCode.set(code, unit);
  return previous;
}

export function removeCurrency(currencyCode: string): CurrencyUnit | undefined {
  const code = normalizeCode(currencyCode);
  const previous = byCode.get(code);
  if (previous) {
    byCode.delete(code);
  }
  return previous;
}

export function resolveCurrency(
  currency: string | CurrencyUnit,
): CurrencyUnit {
  if (typeof currency === "string") {
    return getCurrency(currency);
  }
  return currency;
}
