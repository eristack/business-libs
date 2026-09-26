import { ISO_3166_1_ALPHA2_SET, ISO_3166_1_ALPHA2_CODES } from "./alpha2-codes.js";
import { CountryCodeError } from "./errors.js";
import type { CountryCodeAlpha2 } from "./types.js";

const ALPHA2_FORMAT = /^[A-Z]{2}$/;

/** True when `code` is an assigned ISO 3166-1 alpha-2 code (after trim/uppercase). */
export function isAssignedAlpha2(code: string): boolean {
  const upper = code.trim().toUpperCase();
  return ALPHA2_FORMAT.test(upper) && ISO_3166_1_ALPHA2_SET.has(upper);
}

/** Normalize to assigned alpha-2 or throw `CountryCodeError`. */
export function normalizeAlpha2(code: string): CountryCodeAlpha2 {
  const upper = code.trim().toUpperCase();
  if (!ALPHA2_FORMAT.test(upper)) {
    throw new CountryCodeError(
      `Invalid country code "${code}" — expected ISO 3166-1 alpha-2 (two letters)`,
    );
  }
  if (!ISO_3166_1_ALPHA2_SET.has(upper)) {
    throw new CountryCodeError(
      `Country code "${upper}" is not an assigned ISO 3166-1 alpha-2 code`,
    );
  }
  return upper as CountryCodeAlpha2;
}

/** Readonly list of assigned alpha-2 codes (stable order). */
export function listAssignedAlpha2(): readonly string[] {
  return ISO_3166_1_ALPHA2_CODES;
}

export function compareAlpha2(a: string, b: string): number {
  return normalizeAlpha2(a).localeCompare(normalizeAlpha2(b));
}
