import { isCurrencyAvailable } from "@eristack/money";

import { CurrencyPairParseError } from "./errors.js";
import type { CurrencyPair } from "./types.js";

function normalizeCode(code: string, field: string): string {
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(upper)) {
    throw new CurrencyPairParseError(`${field} must be a 3-letter ISO code`);
  }
  if (!isCurrencyAvailable(upper)) {
    throw new CurrencyPairParseError(`Unknown currency code ${upper}`);
  }
  return upper;
}

export function normalizeCurrencyPair(base: string, quote: string): CurrencyPair {
  const baseCode = normalizeCode(base, "base");
  const quoteCode = normalizeCode(quote, "quote");
  if (baseCode === quoteCode) {
    throw new CurrencyPairParseError("base and quote must differ");
  }
  return { base: baseCode, quote: quoteCode };
}

export function formatPairKey(pair: CurrencyPair): string {
  const p = normalizeCurrencyPair(pair.base, pair.quote);
  return `${p.base}/${p.quote}`;
}

export function invertPair(pair: CurrencyPair): CurrencyPair {
  const p = normalizeCurrencyPair(pair.base, pair.quote);
  return { base: p.quote, quote: p.base };
}
