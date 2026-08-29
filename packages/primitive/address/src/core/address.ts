import type { AddressFormatOptions, CountryCode, PostalAddress } from "./types.js";

export class AddressParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddressParseError";
  }
}

const COUNTRY_CODE = /^[A-Z]{2}$/;

/** Uppercase ISO alpha-2 country code. */
export function normalizeCountryCode(code: string): CountryCode {
  const upper = code.trim().toUpperCase();
  if (!COUNTRY_CODE.test(upper)) {
    throw new AddressParseError(`Invalid country code "${code}" — expected ISO alpha-2`);
  }
  return upper;
}

/** Trim strings, normalize country code, reject empty required fields. */
export function normalizeAddress(input: PostalAddress): PostalAddress {
  const line1 = input.line1.trim();
  const locality = input.locality.trim();
  if (!line1) {
    throw new AddressParseError("Address line1 is required");
  }
  if (!locality) {
    throw new AddressParseError("Address locality is required");
  }
  return {
    line1,
    line2: input.line2?.trim() || undefined,
    locality,
    region: input.region?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    countryCode: normalizeCountryCode(input.countryCode),
  };
}

/** Single-line display for labels and shipping docs. */
export function formatAddressOneLine(
  address: PostalAddress,
  options: AddressFormatOptions = {},
): string {
  const sep = options.separator ?? ", ";
  const normalized = normalizeAddress(address);
  const parts = [
    normalized.line1,
    normalized.line2,
    normalized.locality,
    normalized.region,
    normalized.postalCode,
    normalized.countryCode,
  ].filter((p): p is string => Boolean(p && p.length > 0));
  return parts.join(sep);
}

/** Multi-line block for invoices and print layouts. */
export function formatAddressLines(address: PostalAddress): string[] {
  const normalized = normalizeAddress(address);
  const lines = [normalized.line1];
  if (normalized.line2) lines.push(normalized.line2);
  const cityLine = [normalized.locality, normalized.region, normalized.postalCode]
    .filter(Boolean)
    .join(" ");
  if (cityLine) lines.push(cityLine);
  lines.push(normalized.countryCode);
  return lines;
}

export function isSameCountry(a: PostalAddress, b: PostalAddress): boolean {
  return normalizeCountryCode(a.countryCode) === normalizeCountryCode(b.countryCode);
}
