import { CountryCodeError, normalizeAlpha2 } from "@eristack/iso-3166";
import { UNLOCODE_SAMPLE_SET } from "./sample-locodes.js";
import { UnlocodeError } from "./errors.js";
import type { ParsedUnlocode, Unlocode } from "./types.js";

const COMPACT = /^[A-Z]{2}[A-Z0-9]{3}$/;

function compact(raw: string): string {
  return raw.replace(/\s+/g, "").trim().toUpperCase();
}

/** True when code matches UN/LOCODE shape and country is assigned ISO 3166-1 alpha-2. */
export function isValidUnlocodeFormat(code: string): boolean {
  try {
    normalizeUnlocode(code);
    return true;
  } catch {
    return false;
  }
}

/** True when code is in the in-package sample list (major ports). Full UN list → reference-data later. */
export function isSampleUnlocode(code: string): boolean {
  const normalized = compact(code);
  return UNLOCODE_SAMPLE_SET.has(normalized);
}

/** Normalize to five-character UN/LOCODE or throw `UnlocodeError`. */
export function normalizeUnlocode(code: string): Unlocode {
  const normalized = compact(code);
  if (normalized.length !== 5) {
    throw new UnlocodeError(
      `Invalid UN/LOCODE "${code}" — expected five characters (e.g. IDJKT or "ID JKT")`,
    );
  }
  if (!COMPACT.test(normalized)) {
    throw new UnlocodeError(
      `Invalid UN/LOCODE "${code}" — expected CCXXX (country + location)`,
    );
  }
  try {
    normalizeAlpha2(normalized.slice(0, 2));
  } catch (error) {
    if (error instanceof CountryCodeError) {
      throw new UnlocodeError(error.message);
    }
    throw error;
  }
  return normalized as Unlocode;
}

export function parseUnlocode(code: string): ParsedUnlocode {
  const normalized = normalizeUnlocode(code);
  return {
    country: normalizeAlpha2(normalized.slice(0, 2)),
    location: normalized.slice(2),
    code: normalized,
  };
}

/** Display with space between country and location (`ID JKT`). */
export function formatUnlocodeDisplay(code: string): string {
  const normalized = normalizeUnlocode(code);
  return `${normalized.slice(0, 2)} ${normalized.slice(2)}`;
}

export function compareUnlocode(a: string, b: string): number {
  return normalizeUnlocode(a).localeCompare(normalizeUnlocode(b));
}

export function countryFromUnlocode(code: string) {
  return parseUnlocode(code).country;
}
