import { ISO_3166_1_ALPHA3_TO_ALPHA2, ISO_3166_1_ALPHA2_TO_ALPHA3 } from "./alpha3-map.js";
import { normalizeAlpha2 } from "./alpha2.js";
import { CountryCodeError } from "./errors.js";
import type { CountryCodeAlpha2, CountryCodeAlpha3 } from "./types.js";

const ALPHA3_FORMAT = /^[A-Z]{3}$/;

/** Alpha-3 → assigned alpha-2. */
export function alpha3ToAlpha2(code: string): CountryCodeAlpha2 {
  const upper = code.trim().toUpperCase();
  if (!ALPHA3_FORMAT.test(upper)) {
    throw new CountryCodeError(
      `Invalid alpha-3 country code "${code}" — expected three letters`,
    );
  }
  const a2 = ISO_3166_1_ALPHA3_TO_ALPHA2[upper];
  if (!a2) {
    throw new CountryCodeError(
      `Alpha-3 code "${upper}" is not an assigned ISO 3166-1 alpha-3 code`,
    );
  }
  return normalizeAlpha2(a2);
}

/** Alpha-2 → preferred alpha-3 when known. */
export function alpha2ToAlpha3(code: string): CountryCodeAlpha3 {
  const a2 = normalizeAlpha2(code);
  const a3 = ISO_3166_1_ALPHA2_TO_ALPHA3.get(a2);
  if (!a3) {
    throw new CountryCodeError(`No alpha-3 mapping registered for "${a2}"`);
  }
  return a3 as CountryCodeAlpha3;
}
