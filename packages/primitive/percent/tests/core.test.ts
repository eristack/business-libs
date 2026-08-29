import { describe, expect, it } from "vitest";
import {
  fromBasisPoints,
  minusPercent,
  parsePercent,
  percentOf,
  plusPercent,
  toBasisPoints,
} from "../src/index.js";

describe("@eristack/percent", () => {
  it("parses percent symbol and basis points", () => {
    expect(parsePercent("11%").ratio).toBe("0.11");
    expect(fromBasisPoints("1100").ratio).toBe("0.11");
    expect(toBasisPoints(parsePercent("11%"))).toBe("1100");
  });

  it("computes percentOf and plus/minus on strings", () => {
    const tax = parsePercent("10%");
    expect(percentOf("100", tax)).toBe("10");
    expect(plusPercent("100", tax)).toBe("110");
    expect(minusPercent("100", tax)).toBe("90");
  });
});
