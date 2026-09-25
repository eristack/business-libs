import { createFiscalCalendar, FiscalCalendarError, findPeriodForDate } from "./calendar.js";
import type { FiscalCalendarDefinition, FiscalPeriod } from "./types.js";
import type { WallClock } from "@eristack/timestamp";

/** Stable code for HTTP mappers when no period covers a date. */
export const PERIOD_MISSING_CODE = "PERIOD_MISSING" as const;

export class PeriodMissingError extends FiscalCalendarError {
  readonly code = PERIOD_MISSING_CODE;

  constructor(
    readonly calendarId: string,
    readonly localDate: string,
  ) {
    super(
      `No fiscal period in calendar "${calendarId}" for local date ${localDate}`,
    );
    this.name = "PeriodMissingError";
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Month boundaries from UTC date parts only — no local TZ drift. */
export function monthsForCalendarYear(year: number): FiscalPeriod[] {
  const periods: FiscalPeriod[] = [];
  for (let month = 1; month <= 12; month++) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const start = `${year}-${pad2(month)}-01`;
    const end = `${year}-${pad2(month)}-${pad2(lastDay)}`;
    periods.push({
      id: `${year}-M${pad2(month)}`,
      fiscalYear: year,
      periodNumber: month,
      start,
      end,
      status: "open",
    });
  }
  return periods;
}

/** Bootstrap calendar-year fiscal calendars (12 open months per year). */
export function createCalendarYearCalendar(options: {
  id: string;
  timezone: string;
  years: number[];
}): FiscalCalendarDefinition {
  return createFiscalCalendar({
    id: options.id,
    timezone: options.timezone,
    years: options.years.map((year) => ({
      year,
      periods: monthsForCalendarYear(year),
    })),
  });
}

export function requirePeriodForDate(
  calendar: FiscalCalendarDefinition,
  date: WallClock,
): FiscalPeriod {
  const period = findPeriodForDate(calendar, date);
  if (!period) {
    throw new PeriodMissingError(calendar.id, date.local.slice(0, 10));
  }
  return period;
}
