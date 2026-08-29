import { describe, expect, it } from "vitest";
import {
  exchangeRate,
  isExchangeRateStale,
  rateAsOfInstant,
} from "../src/core/convert/conversion.js";

describe("exchangeRate asOf", () => {
  it("stores asOf from ISO string", () => {
    const rate = exchangeRate({
      base: "USD",
      term: "IDR",
      factor: "15000",
      asOf: "2026-01-15T00:00:00.000Z",
    });
    expect(rateAsOfInstant(rate)).toBe("2026-01-15T00:00:00.000Z");
  });

  it("flags stale rates", () => {
    const rate = exchangeRate({
      base: "USD",
      term: "EUR",
      factor: "0.9",
      asOf: "2026-01-01T00:00:00.000Z",
    });
    expect(
      isExchangeRateStale(rate, {
        maxAgeMs: 86_400_000,
        now: "2026-01-03T00:00:00.000Z",
      }),
    ).toBe(true);
  });
});
