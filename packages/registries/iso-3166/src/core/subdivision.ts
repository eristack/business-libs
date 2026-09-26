import { normalizeAlpha2 } from "./alpha2.js";
import { CountryCodeError } from "./errors.js";
import type { SubdivisionCode } from "./types.js";

const SUBDIVISION = /^[A-Z]{2}-[\dA-Z]{1,8}$/;

/**
 * Normalize ISO 3166-2 subdivision id (`US-CA`, `ID-JK`).
 * Validates format and matching country prefix — not full subdivision registry membership.
 */
export function normalizeSubdivisionCode(
  countryAlpha2: string,
  subdivision: string,
): SubdivisionCode {
  const country = normalizeAlpha2(countryAlpha2);
  let raw = subdivision.trim().toUpperCase();
  if (!raw.includes("-")) {
    raw = `${country}-${raw}`;
  }
  if (!SUBDIVISION.test(raw)) {
    throw new CountryCodeError(
      `Invalid subdivision "${subdivision}" — expected ISO 3166-2 form CC-XXX`,
    );
  }
  const prefix = raw.slice(0, 2);
  if (prefix !== country) {
    throw new CountryCodeError(
      `Subdivision "${raw}" does not match country "${country}"`,
    );
  }
  return raw as SubdivisionCode;
}
