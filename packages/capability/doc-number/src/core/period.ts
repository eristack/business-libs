import { instantOf, toLocalParts } from "@eristack/timestamp";
import type { ResetPeriod } from "./types.js";

function utcParts(at: Date) {
  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
  };
}

function calendarParts(at: Date, timezone?: string) {
  if (!timezone || timezone === "UTC") {
    return utcParts(at);
  }
  const local = toLocalParts(instantOf(at, timezone));
  return { year: local.year, month: local.month, day: local.day };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Period bucket key for sequence rows. Default timezone is UTC (unchanged from 0.3.x). */
export function periodKeyFor(
  reset: ResetPeriod,
  at: Date,
  timezone?: string,
): string {
  const { year, month, day } = calendarParts(at, timezone);
  switch (reset) {
    case "never":
      return "*";
    case "yearly":
      return String(year);
    case "monthly":
      return `${year}-${pad2(month)}`;
    case "daily":
      return `${year}-${pad2(month)}-${pad2(day)}`;
    default: {
      const _exhaustive: never = reset;
      throw new Error(`Unsupported reset: ${String(_exhaustive)}`);
    }
  }
}

export function datePartsFor(
  at: Date,
  timezone?: string,
): {
  YYYY: string;
  YY: string;
  MM: string;
  DD: string;
} {
  const { year, month, day } = calendarParts(at, timezone);
  return {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: pad2(month),
    DD: pad2(day),
  };
}

/** @deprecated Prefer `datePartsFor(at, timezone)` — UTC calendar parts. */
export function datePartsUtc(at: Date): {
  YYYY: string;
  YY: string;
  MM: string;
  DD: string;
} {
  return datePartsFor(at, "UTC");
}
