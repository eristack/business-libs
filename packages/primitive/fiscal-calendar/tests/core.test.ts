import { describe, expect, it } from "vitest";
import { wallOf } from "@eristack/timestamp";
import {
  assertPeriodOpen,
  createFiscalCalendar,
  findPeriodForDate,
  FiscalCalendarError,
} from "../src/index.js";

const calendar = createFiscalCalendar({
  id: "co-a",
  timezone: "Asia/Jakarta",
  years: [
    {
      year: 2026,
      periods: [
        {
          id: "2026-p01",
          fiscalYear: 2026,
          periodNumber: 1,
          start: "2026-01-01",
          end: "2026-01-31",
          status: "open",
        },
        {
          id: "2026-p02",
          fiscalYear: 2026,
          periodNumber: 2,
          start: "2026-02-01",
          end: "2026-02-28",
          status: "closed",
        },
      ],
    },
  ],
});

describe("@eristack/fiscal-calendar", () => {
  it("finds period for wall date", () => {
    const date = wallOf("2026-01-15T10:00:00", "Asia/Jakarta");
    expect(findPeriodForDate(calendar, date)?.id).toBe("2026-p01");
  });

  it("assertPeriodOpen throws when closed", () => {
    const closed = calendar.years[0]!.periods[1]!;
    expect(() => assertPeriodOpen(closed)).toThrow(FiscalCalendarError);
  });
});
