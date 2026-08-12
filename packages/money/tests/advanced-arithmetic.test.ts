import { describe, expect, it } from "vitest";
import {
  ArithmeticError,
  CurrencyMismatchError,
  Discount,
  Markup,
  Money,
  Percent,
  Rounding,
  Tax,
} from "../src/index.js";

describe("Money aggregates", () => {
  it("sums line items", () => {
    const total = Money.sum([
      Money.of("10.00", "USD"),
      Money.of("2.50", "USD"),
      Money.of("0.25", "USD"),
    ]);
    expect(total.amountString()).toBe("12.75");
  });

  it("sums empty list to zero when currency provided", () => {
    expect(Money.sum([], "USD").isZero()).toBe(true);
    expect(() => Money.sum([])).toThrow(ArithmeticError);
  });

  it("rejects mixed currencies on sum", () => {
    expect(() =>
      Money.sum([Money.of("1", "USD"), Money.of("1", "EUR")]),
    ).toThrow(CurrencyMismatchError);
  });

  it("min / max / average", () => {
    const a = Money.of("3.00", "USD");
    const b = Money.of("9.00", "USD");
    const c = Money.of("6.00", "USD");
    expect(Money.min(a, b, c).amountString()).toBe("3");
    expect(Money.max(a, b, c).amountString()).toBe("9");
    expect(Money.average([a, b, c]).amountString()).toBe("6");
  });
});

describe("percent helpers", () => {
  it("computes percentOf / plusPercent / minusPercent", () => {
    const price = Money.of("200.00", "USD");
    expect(price.percentOf("7").amountString()).toBe("14");
    expect(price.plusPercent("10").amountString()).toBe("220");
    expect(price.minusPercent("25").amountString()).toBe("150");
  });

  it("accepts fractional percent strings", () => {
    const price = Money.of("100.00", "USD");
    expect(price.percentOf("7.5").amountString()).toBe("7.5");
  });

  it("ratio and percentRatio are dimensionless strings", () => {
    const profit = Money.of("25.00", "USD");
    const revenue = Money.of("200.00", "USD");
    expect(Money.ratio(profit, revenue)).toBe("0.125");
    expect(Money.percentRatio(profit, revenue)).toBe("12.5");
  });

  it("rejects ratio with zero denominator", () => {
    expect(() =>
      Money.ratio(Money.of("1", "USD"), Money.zero("USD")),
    ).toThrow(ArithmeticError);
  });
});

describe("Discount / Markup / Tax operators", () => {
  const round = Rounding.currencyDefault();

  it("applies discount and markup via with()", () => {
    const line = Money.of("100.00", "USD");
    expect(line.with(Discount.ofPercent("5")).amountString()).toBe("95");
    expect(line.with(Markup.ofPercent("5")).amountString()).toBe("105");
    expect(line.with(Percent.of("5")).amountString()).toBe("5");
  });

  it("computes exclusive tax and inclusive extract", () => {
    const net = Money.of("100.00", "USD");
    const tax = net.with(Tax.onExclusive("11")).with(round);
    expect(tax.amountString()).toBe("11");
    const gross = net.add(tax);
    expect(gross.amountString()).toBe("111");

    const extractedNet = gross.with(Tax.netFromInclusive("11")).with(round);
    expect(extractedNet.amountString()).toBe("100");
    const extractedTax = gross.with(Tax.extractFromInclusive("11")).with(round);
    expect(extractedTax.amountString()).toBe("11");
  });

  it("supports invoice recipe with helpers", () => {
    const line = Money.of("149.70", "USD");
    const net = line.with(Discount.ofPercent("5")).with(round);
    const tax = net.with(Tax.onExclusive("11")).with(round);
    const total = Money.sum([net, tax]).with(round);
    expect(net.amountString()).toBe("142.22");
    expect(tax.amountString()).toBe("15.64");
    expect(total.amountString()).toBe("157.86");
  });
});
