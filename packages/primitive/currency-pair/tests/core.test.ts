import { describe, expect, it } from "vitest";

import {
  CurrencyPairParseError,
  formatPairKey,
  invertPair,
  normalizeCurrencyPair,
} from "../src/index.js";

describe("normalizeCurrencyPair", () => {
  it("uppercases known codes", () => {
    expect(normalizeCurrencyPair("usd", "idr")).toEqual({
      base: "USD",
      quote: "IDR",
    });
  });

  it("rejects same currency", () => {
    expect(() => normalizeCurrencyPair("USD", "USD")).toThrow(
      CurrencyPairParseError,
    );
  });
});

describe("formatPairKey", () => {
  it("renders BASE/QUOTE", () => {
    expect(formatPairKey({ base: "EUR", quote: "USD" })).toBe("EUR/USD");
  });
});

describe("invertPair", () => {
  it("swaps base and quote", () => {
    expect(invertPair({ base: "USD", quote: "JPY" })).toEqual({
      base: "JPY",
      quote: "USD",
    });
  });
});
