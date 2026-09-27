import type { WallDate } from "./wall-date.js";

export type BusinessCalendarOptions = {
  /** UTC day-of-week integers 0=Sunday … 6=Saturday treated as non-working. */
  weekendDays: readonly number[];
  /** Holiday wall dates `YYYY-MM-DD`. */
  holidays: readonly string[];
};

export type BusinessCalendar = {
  isBusinessDay(date: string): boolean;
  nextBusinessDay(date: string): WallDate;
  addBusinessDays(date: string, days: number): WallDate;
};
