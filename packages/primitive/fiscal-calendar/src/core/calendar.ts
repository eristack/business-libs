import { isWallInRange, wallOf, type WallClock } from "@eristack/timestamp";
import type {
  FiscalCalendarDefinition,
  FiscalDate,
  FiscalPeriod,
  PeriodStatus,
} from "./types.js";

export class FiscalCalendarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FiscalCalendarError";
  }
}

function wallFromFiscalDate(date: FiscalDate, timezone: string): WallClock {
  return wallOf(`${date}T00:00:00`, timezone);
}

function flattenPeriods(calendar: FiscalCalendarDefinition): FiscalPeriod[] {
  return calendar.years.flatMap((y) => y.periods);
}

/** Find the period containing a wall clock's local date. */
export function findPeriodForDate(
  calendar: FiscalCalendarDefinition,
  date: WallClock,
): FiscalPeriod | undefined {
  if (date.timezone !== calendar.timezone) {
    throw new FiscalCalendarError(
      `Date timezone ${date.timezone} does not match calendar ${calendar.timezone}`,
    );
  }
  const localDate = date.local.slice(0, 10);
  for (const period of flattenPeriods(calendar)) {
    const start = wallFromFiscalDate(period.start, calendar.timezone);
    const end = wallFromFiscalDate(period.end, calendar.timezone);
    if (isWallInRange(date, start, end)) {
      return period;
    }
    if (localDate >= period.start && localDate <= period.end) {
      return period;
    }
  }
  return undefined;
}

export function assertPeriodOpen(period: FiscalPeriod): void {
  if (period.status === "closed") {
    throw new FiscalCalendarError(
      `Fiscal period ${period.id} (${period.fiscalYear}-P${period.periodNumber}) is closed`,
    );
  }
}

export function listPeriods(
  calendar: FiscalCalendarDefinition,
  options?: { fiscalYear?: number; status?: PeriodStatus },
): readonly FiscalPeriod[] {
  let periods = flattenPeriods(calendar);
  if (options?.fiscalYear != null) {
    periods = periods.filter((p) => p.fiscalYear === options.fiscalYear);
  }
  if (options?.status != null) {
    periods = periods.filter((p) => p.status === options.status);
  }
  return periods;
}

/** Build a calendar from year definitions — validates non-overlapping periods per year. */
export function createFiscalCalendar(
  definition: FiscalCalendarDefinition,
): FiscalCalendarDefinition {
  for (const year of definition.years) {
    const sorted = [...year.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      if (curr.start <= prev.end) {
        throw new FiscalCalendarError(
          `Overlapping periods ${prev.id} and ${curr.id} in FY${year.year}`,
        );
      }
    }
  }
  return definition;
}
