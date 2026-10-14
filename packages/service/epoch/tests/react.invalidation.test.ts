import { describe, expect, it } from "vitest";
import { shouldInvalidateOnEpochChange } from "../src/react/invalidation.js";

describe("shouldInvalidateOnEpochChange", () => {
  it("skips the initial epoch read", () => {
    expect(shouldInvalidateOnEpochChange(undefined, 1)).toBe(false);
  });

  it("skips while epoch is loading", () => {
    expect(shouldInvalidateOnEpochChange(1, undefined)).toBe(false);
  });

  it("fires when the counter bumps", () => {
    expect(shouldInvalidateOnEpochChange(2, 3)).toBe(true);
  });

  it("does not fire when unchanged", () => {
    expect(shouldInvalidateOnEpochChange(4, 4)).toBe(false);
  });
});
