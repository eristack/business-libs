import { describe, expect, it } from "vitest";
import {
  ArithmeticError,
  Conversion,
  convertAtQuotePerBase,
  CurrencyMismatchError,
  formatMoney,
  Money,
  Monetary,
  moneyFromJSON,
  parseMoney,
  Rounding,
  UnknownCurrencyError,
} from "../src/index.js";

describe("Currency", () => {
  it("resolves ISO currencies", () => {
    const usd = Monetary.getCurrency("usd");
    expect(usd.currencyCode).toBe("USD");
    expect(usd.numericCode).toBe(840);
    expect(usd.defaultFractionDigits).toBe(2);

    const jpy = Monetary.getCurrency("JPY");
    expect(jpy.defaultFractionDigits).toBe(0);

    const kwd = Monetary.getCurrency("KWD");
    expect(kwd.defaultFractionDigits).toBe(3);
  });

  it("registers custom currencies", () => {
    Monetary.registerCurrency({
      currencyCode: "PTS",
      numericCode: -1,
      defaultFractionDigits: 0,
    });
    expect(Monetary.getCurrency("PTS").defaultFractionDigits).toBe(0);
    Monetary.removeCurrency("PTS");
    expect(() => Monetary.getCurrency("PTS")).toThrow(UnknownCurrencyError);
  });
});

describe("Money arithmetic", () => {
  it("adds and subtracts same currency", () => {
    const a = Money.of("10.50", "USD");
    const b = Money.of("1.25", "USD");
    expect(a.add(b).amountString()).toBe("11.75");
    expect(a.subtract(b).amountString()).toBe("9.25");
    expect(a.add(b).subtract(b).isEqualTo(a)).toBe(true);
  });

  it("rejects currency mismatch", () => {
    expect(() => Money.of("1", "USD").add(Money.of("1", "EUR"))).toThrow(
      CurrencyMismatchError,
    );
  });

  it("multiplies and may promote to decimal", () => {
    const price = Money.of("19.99", "USD");
    expect(price.getContext().representation).toBe("bigint");
    const tax = price.multiply("0.07");
    expect(tax.getContext().representation).toBe("decimal");
    expect(tax.amountString()).toBe("1.3993");
    const total = price.add(tax).with(Rounding.currencyDefault());
    expect(total.amountString()).toBe("21.39");
    expect(total.getContext().representation).toBe("bigint");
  });

  it("divides exactly on bigint path when possible", () => {
    const amount = Money.of("10.00", "USD");
    const half = amount.divide(2);
    expect(half.amountString()).toBe("5");
    expect(half.getContext().representation).toBe("bigint");
  });

  it("handles JPY zero-scale", () => {
    const yen = Money.of("1000", "JPY");
    expect(yen.multiply(3).amountString()).toBe("3000");
    expect(yen.getContext().representation).toBe("bigint");
  });
});

describe("Rounding & allocate", () => {
  it("rounds with HALF_EVEN", () => {
    expect(Money.of("1.005", "USD").roundTo(2, "HALF_EVEN").amountString()).toBe(
      "1",
    );
    expect(Money.of("1.015", "USD").roundTo(2, "HALF_EVEN").amountString()).toBe(
      "1.02",
    );
  });

  it("allocates evenly with remainder", () => {
    const total = Money.of("10.00", "USD");
    const parts = total.allocate(3);
    expect(parts.map((p) => p.amountString())).toEqual(["3.34", "3.33", "3.33"]);
    const sum = parts.reduce((acc, p) => acc.add(p), Money.zero("USD"));
    expect(sum.isEqualTo(total)).toBe(true);
  });

  it("allocates by ratios", () => {
    const total = Money.of("100.00", "USD");
    const parts = total.allocateByRatios([1, 2, 1]);
    expect(parts.map((p) => p.amountString())).toEqual([
      "25",
      "50",
      "25",
    ]);
  });
});

describe("Format & parse", () => {
  it("formats USD", () => {
    const formatted = formatMoney(Money.of("19.99", "USD"), "en-US");
    expect(formatted).toContain("19.99");
  });

  it("parses locale currency strings", () => {
    const parsed = parseMoney("$19.99", "USD", "en-US");
    expect(parsed.amountString()).toBe("19.99");
  });
});

describe("Conversion & JSON", () => {
  it("converts with supplied rate", () => {
    const usd = Money.of("100.00", "USD");
    const idr = usd.with(
      Conversion.of({ base: "USD", term: "IDR", factor: "15000" }),
    );
    expect(idr.currency.currencyCode).toBe("IDR");
    expect(idr.amountString()).toBe("1500000");
  });

  it("convertAtQuotePerBase uses quote-per-base naming", () => {
    const usd = Money.of("1500", "USD");
    const idr = convertAtQuotePerBase(usd, "16250", "IDR");
    expect(idr.amountString()).toBe("24375000");
  });

  it("convertAtQuotePerBase rejects JS number rates", () => {
    const usd = Money.of("100", "USD");
    expect(() =>
      convertAtQuotePerBase(usd, 16250 as unknown as string, "IDR"),
    ).toThrow(ArithmeticError);
  });

  it("round-trips JSON", () => {
    const original = Money.of("42.50", "EUR");
    const json = original.toJSON();
    expect(json).toEqual({ currency: "EUR", amount: "42.5" });
    expect(moneyFromJSON(json).isEqualTo(original)).toBe(true);
  });

  it("rejects fractional number constructors", () => {
    expect(() => Money.of(19.99, "USD")).toThrow();
  });

  it("throws on divide by zero", () => {
    expect(() => Money.of("1", "USD").divide(0)).toThrow(ArithmeticError);
  });
});
