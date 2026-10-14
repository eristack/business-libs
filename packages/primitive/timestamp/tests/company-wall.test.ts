import { describe, expect, it } from "vitest";
import {
  formatPostedAt,
  timestampJsonFromWallDateInput,
  wallDateInputFromTimestamp,
} from "../src/react/company-wall.js";

describe("company wall react helpers", () => {
  it("reads wall and instant values as YYYY-MM-DD", () => {
    expect(
      wallDateInputFromTimestamp(
        { kind: "wall", local: "2026-09-04T00:00:00", timezone: "Asia/Jakarta" },
        "Asia/Jakarta",
      ),
    ).toBe("2026-09-04");
    expect(
      wallDateInputFromTimestamp(
        {
          kind: "instant",
          instant: "2026-09-03T17:00:00.000Z",
          timezone: "UTC",
        },
        "Asia/Jakarta",
      ),
    ).toBe("2026-09-04");
  });

  it("writes wall date JSON at start of company day", () => {
    expect(timestampJsonFromWallDateInput("2026-09-04", "Asia/Jakarta")).toEqual({
      kind: "wall",
      local: "2026-09-04T00:00:00",
      timezone: "Asia/Jakarta",
    });
  });

  it("formats posted instants for display", () => {
    const text = formatPostedAt(
      {
        kind: "instant",
        instant: "2026-09-03T17:00:00.000Z",
        timezone: "UTC",
      },
      "Asia/Jakarta",
    );
    expect(text).toContain("2026-09-04");
  });
});
