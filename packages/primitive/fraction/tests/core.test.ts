import { describe, expect, it } from "vitest";
import {
  addFraction,
  approximateFraction,
  compareFraction,
  convergentFraction,
  divideFraction,
  formatFraction,
  fraction,
  fractionEquals,
  multiplyFraction,
  parseFraction,
  subtractFraction,
  toDecimal,
} from "../src/index.js";

describe("parseFraction", () => {
  it("parses slash and integer forms", () => {
    expect(parseFraction("3/4")).toEqual({ num: "3", den: "4" });
    expect(parseFraction("-2/5")).toEqual({ num: "-2", den: "5" });
    expect(parseFraction("7")).toEqual({ num: "7", den: "1" });
  });

  it("parses mixed numbers", () => {
    expect(parseFraction("1 1/2")).toEqual({ num: "3", den: "2" });
    expect(parseFraction("-1 1/4")).toEqual({ num: "-5", den: "4" });
  });

  it("reduces to lowest terms", () => {
    expect(fraction("6", "9")).toEqual({ num: "2", den: "3" });
  });
});

describe("arithmetic", () => {
  it("adds and subtracts exactly", () => {
    const a = parseFraction("1/3");
    const b = parseFraction("1/6");
    expect(addFraction(a, b)).toEqual({ num: "1", den: "2" });
    expect(subtractFraction(b, a)).toEqual({ num: "-1", den: "6" });
  });

  it("multiplies and divides", () => {
    const a = parseFraction("2/3");
    const b = parseFraction("3/5");
    expect(multiplyFraction(a, b)).toEqual({ num: "2", den: "5" });
    expect(divideFraction(a, b)).toEqual({ num: "10", den: "9" });
  });

  it("compares cross-multiply", () => {
    expect(compareFraction(parseFraction("1/3"), parseFraction("2/7"))).toBe(1);
    expect(fractionEquals(parseFraction("2/4"), parseFraction("1/2"))).toBe(true);
  });
});

describe("approximateFraction", () => {
  it("approximates repeating decimals", () => {
    const f = approximateFraction("0.3333333333", { maxDenominator: "1000" });
    expect(f).toEqual({ num: "1", den: "3" });
  });

  it("approximates irrationals with a cap", () => {
    const sqrt2 = approximateFraction("1.4142135623730951", {
      maxDenominator: "1000",
    });
    expect(toDecimal(sqrt2, 3)).toBe("1.414");
    expect(formatFraction(sqrt2)).toMatch(/^\d+\/\d+$/);
  });

  it("convergent finds classic pi estimate", () => {
    const pi = convergentFraction("3.141592653589793", "10000");
    expect(pi).toEqual({ num: "355", den: "113" });
  });
});
