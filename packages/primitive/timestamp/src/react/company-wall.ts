import { formatInstant } from "../core/format/format.js";
import { parseTimestamp } from "../core/parse/parse.js";
import {
  timestampFromJSON,
  timestampToJSON,
  type TimestampJSON,
} from "../core/serialize/json.js";
import { Temporal } from "../core/engine/temporal.js";
import { wallOf } from "../core/wall/wall-clock.js";

const WALL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function plainDateFromWallLocal(local: string): string {
  return local.length >= 10 ? local.slice(0, 10) : local;
}

/**
 * YYYY-MM-DD for `<input type="date">` from stored TimestampJSON (wall or instant) in the company zone.
 */
export function wallDateInputFromTimestamp(
  value: unknown,
  companyTimezone: string,
): string {
  if (value == null || value === "") return "";
  const ts = parseTimestamp(value);
  if (ts.kind === "wall") {
    return plainDateFromWallLocal(ts.local);
  }
  const zdt = Temporal.Instant.from(ts.instant).toZonedDateTimeISO(companyTimezone);
  return zdt.toPlainDate().toString();
}

/**
 * Persist a wall-clock business date (start of day) in the company zone as TimestampJSON.
 */
export function timestampJsonFromWallDateInput(
  date: string,
  companyTimezone: string,
): TimestampJSON {
  const trimmed = date.trim();
  if (!WALL_DATE_RE.test(trimmed)) {
    throw new Error(`Wall date input must be YYYY-MM-DD, got "${date}"`);
  }
  return timestampToJSON(wallOf(`${trimmed}T00:00:00`, companyTimezone));
}

/** Round-trip helper for controlled wall-date fields. */
export function writeWallDateField(
  date: string,
  companyTimezone: string,
): TimestampJSON {
  return timestampJsonFromWallDateInput(date, companyTimezone);
}

export function readWallDateField(
  value: unknown,
  companyTimezone: string,
): string {
  return wallDateInputFromTimestamp(value, companyTimezone);
}

export type FormatPostedAtOptions = {
  locale?: string;
  /** Shown when value is null/invalid. Default em dash. */
  empty?: string;
};

/**
 * Display an instant or wall timestamp for audit/posted fields (company calendar + locale).
 */
export function formatPostedAt(
  value: unknown,
  companyTimezone: string,
  options?: FormatPostedAtOptions,
): string {
  const empty = options?.empty ?? "—";
  if (value == null || value === "") return empty;
  try {
    const ts = parseTimestamp(value);
    if (ts.kind === "wall") {
      return plainDateFromWallLocal(ts.local);
    }
    const inCompany = timestampFromJSON({
      kind: "instant",
      instant: ts.instant,
      timezone: companyTimezone,
    });
    if (inCompany.kind !== "instant") return empty;
    return formatInstant(inCompany, {
      style: "datetime",
      locale: options?.locale,
    });
  } catch {
    return empty;
  }
}
