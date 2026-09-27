import { describe, expect, it } from "vitest";

import { createBusinessCalendar, normalizeWallDate } from "../src/index.js";

describe("normalizeWallDate", () => {
  it("canonicalizes valid dates", () => {
    expect(normalizeWallDate(" 2026-01-05 ")).toBe("2026-01-05");
  });
});

describe("createBusinessCalendar", () => {
  const cal = createBusinessCalendar({
    weekendDays: [0, 6],
    holidays: ["2026-01-01"],
  });

  it("detects weekends and holidays", () => {
    expect(cal.isBusinessDay("2026-01-01")).toBe(false);
    expect(cal.isBusinessDay("2026-01-03")).toBe(false); // Sat
    expect(cal.isBusinessDay("2026-01-02")).toBe(true); // Fri
  });

  it("adds business days skipping weekends", () => {
    expect(cal.addBusinessDays("2026-01-02", 1)).toBe("2026-01-05"); // Fri +1 → Mon
  });

  it("finds next business day", () => {
    expect(cal.nextBusinessDay("2026-01-03")).toBe("2026-01-05");
  });
});
