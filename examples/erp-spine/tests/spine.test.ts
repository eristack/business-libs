import { describe, expect, it } from "vitest";
import { calculateLine } from "@eristack/qups";
import { createStockMovement } from "@eristack/stock-movement";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";

/**
 * Minimal procurement spine: PO line math → GR qty post → verify.
 * App-owned PO/GR headers come in a later session (Express + Drizzle).
 */
describe("erp-spine", () => {
  it("receives against a qups PO line with idempotent stock post", async () => {
    const poLine = calculateLine({
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "10",
      unitPrice: "25.00",
    });
    expect(poLine.subtotal).toBe("250");

    const stock = createStockMovement({ store: createMemoryLedgerStore() });
    const locationId = "wh-main";
    const lotId = "LOT-DEMO";
    const itemId = "SKU-WIDGET";
    const grLineId = "gr-line-1";
    const idempotencyKey = "demo-gr-1-line-1";

    const first = await stock.append({
      locationId,
      lotId,
      ownerId: itemId,
      openingBalance: "0",
      inAmount: "10",
      entryType: "goods_receipt",
      entryTypeId: grLineId,
      idempotencyKey,
    });

    const retry = await stock.append({
      locationId,
      lotId,
      ownerId: itemId,
      inAmount: "999",
      entryType: "goods_receipt",
      entryTypeId: grLineId,
      idempotencyKey,
    });

    expect(retry.id).toBe(first.id);

    const snap = await stock.snapshot({ locationId, lotId, ownerId: itemId });
    expect(snap?.balance).toBe("10");

    const verified = await stock.verify({ locationId, lotId, ownerId: itemId });
    expect(verified.ok).toBe(true);
  });
});
