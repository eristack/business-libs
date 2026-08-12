import { describe, expect, it } from "vitest";
import { Money, Rounding } from "@eristack/money";
import {
  AdjustedAmount,
  LineTax,
  PricingLine,
  Qups,
} from "../src/index.js";

describe("Qups", () => {
  it("derives exact quantity from unitPrice+subtotal (10 / 3)", () => {
    const line = Qups.of({
      truth: "unitPrice+subtotal",
      unitPrice: Money.of("3", "USD"),
      subtotal: Money.of("10", "USD"),
    });

    expect(line.truth).toBe("unitPrice+subtotal");
    expect(line.unitPrice.isEqualTo(Money.of("3", "USD"))).toBe(true);
    expect(line.subtotal.isEqualTo(Money.of("10", "USD"))).toBe(true);
    expect(line.quantityRatio).toEqual({
      numerator: "10",
      denominator: "3",
    });
    expect(line.product().isEqualTo(line.subtotal)).toBe(true);
  });

  it("derives subtotal from quantity+unitPrice", () => {
    const line = Qups.of({
      truth: "quantity+unitPrice",
      quantity: "2",
      unitPrice: Money.of("4.50", "USD"),
    });
    expect(line.subtotal.isEqualTo(Money.of("9.00", "USD"))).toBe(true);
  });

  it("edit subtotal keeps unitPrice and recomputes qty by default", () => {
    const line = Qups.of({
      truth: "quantity+unitPrice",
      quantity: "2",
      unitPrice: Money.of("5", "USD"),
    }).edit({ subtotal: Money.of("10", "USD") });

    expect(line.truth).toBe("unitPrice+subtotal");
    expect(line.quantity).toBe("2");
  });
});

describe("AdjustedAmount", () => {
  it("stacks percent discount and nominal surcharge", () => {
    const adj = AdjustedAmount.of({
      truth: "base+modifiers",
      base: Money.of("100", "USD"),
      modifiers: [
        { kind: "discount", type: "percent", percent: "10" },
        { kind: "surcharge", type: "nominal", amount: Money.of("5", "USD") },
      ],
    });
    // 100 - 10% = 90 + 5 = 95
    expect(adj.net.isEqualTo(Money.of("95", "USD"))).toBe(true);
    expect(adj.discountTotal.isEqualTo(Money.of("10", "USD"))).toBe(true);
    expect(adj.surchargeTotal.isEqualTo(Money.of("5", "USD"))).toBe(true);
  });

  it("derives nominal discount from base+net", () => {
    const adj = AdjustedAmount.of({
      truth: "base+net",
      base: Money.of("100", "USD"),
      net: Money.of("85", "USD"),
    });
    expect(adj.modifiers[0]?.kind).toBe("discount");
    expect(adj.discountTotal.isEqualTo(Money.of("15", "USD"))).toBe(true);
  });
});

describe("LineTax + PricingLine", () => {
  it("builds exclusive tax on adjusted net", () => {
    const line = PricingLine.of({
      qups: {
        truth: "quantity+unitPrice",
        quantity: "1",
        unitPrice: Money.of("100", "USD"),
      },
      modifiers: [{ kind: "discount", type: "percent", percent: "10" }],
      tax: { ratePercent: "11" },
    });
    // net 90, tax 9.9, gross 99.9
    expect(line.adjusted.net.isEqualTo(Money.of("90", "USD"))).toBe(true);
    expect(line.tax.tax.isEqualTo(Money.of("9.9", "USD"))).toBe(true);
  });

  it("rounds at the boundary", () => {
    const tax = LineTax.of({
      truth: "net+rate",
      net: Money.of("19.99", "USD"),
      ratePercent: "7",
    }).withRounding(Rounding.currencyDefault());
    expect(tax.tax.isEqualTo(Money.of("1.40", "USD"))).toBe(true);
  });
});
