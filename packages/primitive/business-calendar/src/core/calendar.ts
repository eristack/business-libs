import { BusinessCalendarParseError } from "./errors.js";
import type { BusinessCalendar, BusinessCalendarOptions } from "./types.js";
import {
  addWallDays,
  normalizeWallDate,
  wallDateDayOfWeek,
  type WallDate,
} from "./wall-date.js";

function normalizeWeekendDays(days: readonly number[]): ReadonlySet<number> {
  const set = new Set<number>();
  for (const day of days) {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new BusinessCalendarParseError(
        `weekendDays entry ${day} must be an integer 0–6 (Sun–Sat)`,
      );
    }
    set.add(day);
  }
  return set;
}

export function createBusinessCalendar(
  options: BusinessCalendarOptions,
): BusinessCalendar {
  const weekendDays = normalizeWeekendDays(options.weekendDays);
  const holidays = new Set(
    options.holidays.map((h) => normalizeWallDate(h)),
  );

  function isBusinessDay(date: string): boolean {
    const wall = normalizeWallDate(date);
    if (holidays.has(wall)) {
      return false;
    }
    const dow = wallDateDayOfWeek(wall);
    return !weekendDays.has(dow);
  }

  function nextBusinessDay(date: string): WallDate {
    let cursor = normalizeWallDate(date);
    do {
      cursor = addWallDays(cursor, 1);
    } while (!isBusinessDay(cursor));
    return cursor;
  }

  function addBusinessDays(date: string, days: number): WallDate {
    if (!Number.isInteger(days)) {
      throw new BusinessCalendarParseError("days must be an integer");
    }
    let cursor = normalizeWallDate(date);
    if (days === 0) {
      return cursor;
    }
    const step = days > 0 ? 1 : -1;
    let remaining = Math.abs(days);
    while (remaining > 0) {
      cursor = addWallDays(cursor, step);
      if (isBusinessDay(cursor)) {
        remaining -= 1;
      }
    }
    return cursor;
  }

  return { isBusinessDay, nextBusinessDay, addBusinessDays };
}
