import { describe, expect, it } from "vitest";
import { ParseError } from "../src/core/errors/index.js";
import {
  compareDecimalStrings,
  parseDecimalFilter,
} from "../src/core/decimal/index.js";

describe("compareDecimalStrings", () => {
  it("orders decimals without float corruption", () => {
    expect(compareDecimalStrings("4990000.00", "1200.50")).toBeGreaterThan(0);
    expect(compareDecimalStrings("300.00", "1200.50")).toBeLessThan(0);
    expect(compareDecimalStrings("10.0", "10.00")).toBe(0);
  });
});

describe("parseDecimalFilter", () => {
  it("returns trimmed decimal strings", () => {
    expect(parseDecimalFilter(" 1000.00 ")).toBe("1000.00");
  });

  it("rejects JSON numbers", () => {
    expect(() => parseDecimalFilter(19.99)).toThrow(ParseError);
  });
});
