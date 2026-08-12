import { describe, expect, it } from "vitest";
import { periodKeyFor } from "../src/index.js";

describe("periodKeyFor", () => {
  const at = new Date("2026-08-11T15:30:00.000Z");

  it("builds buckets for each reset mode", () => {
    expect(periodKeyFor("never", at)).toBe("*");
    expect(periodKeyFor("yearly", at)).toBe("2026");
    expect(periodKeyFor("monthly", at)).toBe("2026-08");
    expect(periodKeyFor("daily", at)).toBe("2026-08-11");
  });
});
