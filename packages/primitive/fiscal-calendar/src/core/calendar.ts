import type { WallClock } from "@eristack/timestamp";
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

function fiscalDateOf(clock: WallClock): FiscalDate {
  return clock.local.slice(0, 10);
}

function flattenPeriods(calendar: FiscalCalendarDefinition): FiscalPeriod[] {
  return calendar.years.flatMap((y) => y.periods);
}

/** Find the period containing a wall clock's **local calendar date**. */
export function findPeriodForDate(
  calendar: FiscalCalendarDefinition,
  date: WallClock,
): FiscalPeriod | undefined {
  if (date.timezone !== calendar.timezone) {
    throw new FiscalCalendarError(
      `Date timezone ${date.timezone} does not match calendar ${calendar.timezone}`,
    );
  }
  const localDate = fiscalDateOf(date);
  for (const period of flattenPeriods(calendar)) {
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

/** Build a calendar from year definitions — validates period bounds and non-overlap. */
export function createFiscalCalendar(
  definition: FiscalCalendarDefinition,
): FiscalCalendarDefinition {
  for (const year of definition.years) {
    for (const period of year.periods) {
      if (period.start > period.end) {
        throw new FiscalCalendarError(
          `Period ${period.id}: start ${period.start} is after end ${period.end}`,
        );
      }
    }
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
