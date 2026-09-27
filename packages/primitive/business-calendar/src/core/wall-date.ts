import { BusinessCalendarParseError } from "./errors.js";

/** Calendar date `YYYY-MM-DD` (no time zone — wall intent). */
export type WallDate = string;

const WALL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeWallDate(value: string): WallDate {
  const trimmed = value.trim();
  const match = WALL_DATE_RE.exec(trimmed);
  if (!match) {
    throw new BusinessCalendarParseError(
      `Invalid wall date "${value}" — expected YYYY-MM-DD`,
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new BusinessCalendarParseError(`Invalid calendar date "${value}"`);
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function wallDateDayOfWeek(date: WallDate): number {
  const normalized = normalizeWallDate(date);
  const [y, m, d] = normalized.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addWallDays(date: WallDate, days: number): WallDate {
  const normalized = normalizeWallDate(date);
  const [y, m, d] = normalized.split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(y, m - 1, d));
  next.setUTCDate(next.getUTCDate() + days);
  const ny = next.getUTCFullYear();
  const nm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(next.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}
