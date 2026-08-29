import { describe, expect, it } from "vitest";
import { wallOf } from "@eristack/timestamp";
import {
  assertPeriodOpen,
  createFiscalCalendar,
  findPeriodForDate,
  FiscalCalendarError,
  listPeriods,
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
  it("rejects overlapping periods", () => {
    expect(() =>
      createFiscalCalendar({
        id: "overlap",
        timezone: "UTC",
        years: [
          {
            year: 2026,
            periods: [
              {
                id: "a",
                fiscalYear: 2026,
                periodNumber: 1,
                start: "2026-01-01",
                end: "2026-01-31",
                status: "open",
              },
              {
                id: "b",
                fiscalYear: 2026,
                periodNumber: 2,
                start: "2026-01-15",
                end: "2026-02-15",
                status: "open",
              },
            ],
          },
        ],
      }),
    ).toThrow(/Overlapping/i);
  });

  it("throws on timezone mismatch", () => {
    const utc = wallOf("2026-01-15T00:00:00", "UTC");
    expect(() => findPeriodForDate(calendar, utc)).toThrow(FiscalCalendarError);
  });

  it("listPeriods filters by status", () => {
    const open = listPeriods(calendar, { status: "open" });
    expect(open.every((p) => p.status === "open")).toBe(true);
    expect(open.some((p) => p.id === "2026-p02")).toBe(false);
  });

  it("rejects inverted period bounds at create", () => {
    expect(() =>
      createFiscalCalendar({
        id: "bad",
        timezone: "UTC",
        years: [
          {
            year: 2026,
            periods: [
              {
                id: "p1",
                fiscalYear: 2026,
                periodNumber: 1,
                start: "2026-02-01",
                end: "2026-01-01",
                status: "open",
              },
            ],
          },
        ],
      }),
    ).toThrow(/after end/i);
  });

  it("finds period on inclusive end boundary", () => {
    const endDay = wallOf("2026-01-31T23:59:59", "Asia/Jakarta");
    expect(findPeriodForDate(calendar, endDay)?.id).toBe("2026-p01");
  });

  it("returns undefined outside defined periods", () => {
    const outside = wallOf("2026-03-01T00:00:00", "Asia/Jakarta");
    expect(findPeriodForDate(calendar, outside)).toBeUndefined();
  });

  it("finds period for wall date", () => {
    const date = wallOf("2026-01-15T10:00:00", "Asia/Jakarta");
    expect(findPeriodForDate(calendar, date)?.id).toBe("2026-p01");
  });

  it("assertPeriodOpen throws when closed", () => {
    const closed = calendar.years[0]!.periods[1]!;
    expect(() => assertPeriodOpen(closed)).toThrow(FiscalCalendarError);
  });
});
