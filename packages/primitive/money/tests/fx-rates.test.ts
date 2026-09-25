import { describe, expect, it } from "vitest";
import { Money } from "../src/index.js";
import {
  convertAt,
  convertAtViaPivot,
  exchangeRate,
  invertFactor,
  MissingFxRateError,
  pickRate,
} from "../src/index.js";

const rates = [
  exchangeRate({
    base: "USD",
    term: "IDR",
    factor: "15000",
    asOf: "2026-01-01T00:00:00.000Z",
  }),
  exchangeRate({
    base: "USD",
    term: "IDR",
    factor: "16000",
    asOf: "2026-02-01T00:00:00.000Z",
  }),
  exchangeRate({
    base: "USD",
    term: "EUR",
    factor: "0.9",
    asOf: "2026-01-15T00:00:00.000Z",
  }),
  exchangeRate({
    base: "EUR",
    term: "GBP",
    factor: "0.85",
    asOf: "2026-01-15T00:00:00.000Z",
  }),
];

describe("pickRate / invertFactor / convertAt", () => {
  it("picks latest rate on or before asOf", () => {
    const rate = pickRate(rates, "USD", "IDR", "2026-01-15T00:00:00.000Z");
    expect(rate.factor).toBe("15000");
    const later = pickRate(rates, "USD", "IDR", "2026-03-01T00:00:00.000Z");
    expect(later.factor).toBe("16000");
  });

  it("throws MissingFxRateError when no rate", () => {
    expect(() =>
      pickRate(rates, "USD", "GBP", "2026-01-01T00:00:00.000Z"),
    ).toThrow(MissingFxRateError);
  });

  it("inverts factor", () => {
    const usdIdr = pickRate(rates, "USD", "IDR", "2026-02-01T00:00:00.000Z");
    const idrUsd = invertFactor(usdIdr);
    expect(idrUsd.base.currencyCode).toBe("IDR");
    expect(idrUsd.term.currencyCode).toBe("USD");
  });

  it("convertAt applies picked rate", () => {
    const usd = Money.of("2", "USD");
    const idr = convertAt(usd, "IDR", "2026-01-10T00:00:00.000Z", rates);
    expect(idr.currency.currencyCode).toBe("IDR");
    expect(idr.toJSON().amount).toBe("30000");
  });

  it("convertAtViaPivot uses intermediate currency", () => {
    const usd = Money.of("100", "USD");
    const gbp = convertAtViaPivot(
      usd,
      "GBP",
      "EUR",
      "2026-01-20T00:00:00.000Z",
      rates,
    );
    expect(gbp.currency.currencyCode).toBe("GBP");
  });
});
