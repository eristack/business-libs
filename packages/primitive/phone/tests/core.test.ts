import { describe, expect, it } from "vitest";
import { normalizeE164, PhoneParseError } from "../src/index.js";

describe("normalizeE164", () => {
  it("strips formatting", () => {
    expect(normalizeE164("+1 (415) 555-0100")).toBe("+14155550100");
  });

  it("rejects missing plus", () => {
    expect(() => normalizeE164("14155550100")).toThrow(PhoneParseError);
  });
});
