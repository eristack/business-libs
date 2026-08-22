import { InvalidTimeZoneError } from "../errors/index.js";
import { Temporal } from "../engine/temporal.js";

/** IANA timezone id, e.g. Asia/Jakarta */
export type TimeZoneId = string;

const OFFSET_ONLY = /^[+-](?:\d{2}(?::?\d{2})?|\d{4})$/;

export function isValidTimeZoneId(zone: string): zone is TimeZoneId {
  if (typeof zone !== "string" || zone.length === 0) return false;
  if (zone === "UTC") return true;
  if (OFFSET_ONLY.test(zone)) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function assertTimeZoneId(zone: string): asserts zone is TimeZoneId {
  if (!isValidTimeZoneId(zone)) {
    throw new InvalidTimeZoneError(`Invalid IANA timezone: ${String(zone)}`);
  }
}

/** Smoke-parse a zone id via Temporal (used by wall/instant resolution). */
export function assertTemporalTimeZone(zone: TimeZoneId): void {
  Temporal.ZonedDateTime.from(`1970-01-01T00:00:00[${zone}]`);
}
