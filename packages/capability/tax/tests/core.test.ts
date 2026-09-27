import { describe, expect, it } from "vitest";
import { Money } from "@eristack/money";
import {
  createTaxRegistry,
  TaxRateNotFoundError,
} from "../src/index.js";

describe("tax", () => {
  it("resolves latest rate on or before asOf", () => {
    const tax = createTaxRegistry({
      codes: [{ code: "VAT-STD", label: "Standard VAT" }],
      rates: [
        { code: "VAT-STD", effectiveFrom: "2026-01-01", ratePercent: "10" },
        { code: "VAT-STD", effectiveFrom: "2026-07-01", ratePercent: "12" },
      ],
    });
    expect(tax.resolveTaxRate({ code: "VAT-STD", asOf: "2026-06-15" }).ratePercent).toBe(
      "10",
    );
    expect(tax.resolveTaxRate({ code: "VAT-STD", asOf: "2026-07-01" }).ratePercent).toBe(
      "12",
    );
  });

  it("applyTaxToAmount delegates to money Tax.onExclusive", () => {
    const tax = createTaxRegistry({
      codes: [{ code: "S" }],
      rates: [{ code: "S", effectiveFrom: "2020-01-01", ratePercent: "10" }],
    });
    const rate = tax.resolveTaxRate({ code: "S", asOf: "2026-01-01" });
    const taxAmt = tax.applyTaxToAmount(Money.of("100.00", "USD"), rate.ratePercent);
    expect(taxAmt.amountString()).toBe("10");
  });

  it("throws when no rate before asOf", () => {
    const tax = createTaxRegistry({
      codes: [{ code: "X" }],
      rates: [{ code: "X", effectiveFrom: "2026-01-01", ratePercent: "5" }],
    });
    expect(() =>
      tax.resolveTaxRate({ code: "X", asOf: "2025-12-31" }),
    ).toThrow(TaxRateNotFoundError);
  });
});
