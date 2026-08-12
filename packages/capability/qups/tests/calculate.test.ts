import { describe, expect, it } from "vitest";
import {
  calculateLine,
  patchLine,
  withQupsColumns,
} from "../src/index.js";

describe("calculateLine (form + BE)", () => {
  it("computes subtotal, tax, and insert columns from plain strings", () => {
    const line = calculateLine({
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "2",
      unitPrice: "50",
      modifiers: [{ kind: "discount", type: "percent", percent: "10" }],
      taxRatePercent: "10",
      round: true,
    });

    expect(line.subtotal).toBe("100");
    expect(line.net).toBe("90");
    expect(line.total).toBe("99");
    expect(line.roles.subtotal).toBe("derived");
    expect(line.columns.currencyUnitPrice).toBe("USD");
    expect(line.columns.unitPrice).toBe("50");

    const row = withQupsColumns({ itemId: "SKU-1", invoiceId: "inv_1" }, line);
    expect(row.itemId).toBe("SKU-1");
    expect(row.quantity).toBe("2");
    expect(row.gross).toBe("99");
  });

  it("keeps exact qty ratio for unitPrice+subtotal", () => {
    const line = calculateLine({
      truth: "unitPrice+subtotal",
      currency: "USD",
      unitPrice: "3",
      subtotal: "10",
    });
    expect(line.quantityRatio).toEqual({
      numerator: "10",
      denominator: "3",
    });
    expect(line.columns.quantityRatioNumerator).toBe("10");
  });

  it("patchLine recalculates when unit price changes (TanStack Form style)", () => {
    let line = calculateLine({
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "2",
      unitPrice: "10",
    });

    line = patchLine(line, { unitPrice: "12" });
    expect(line.unitPrice).toBe("12");
    expect(line.subtotal).toBe("24");
    expect(line.quantity).toBe("2");
  });
});
