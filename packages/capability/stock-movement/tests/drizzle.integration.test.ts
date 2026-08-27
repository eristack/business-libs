import { describe, expect, it, afterEach } from "vitest";
import { setupHclSqlite, type HclHarness } from "@eristack/hash-chained-ledger/testing";
import { createStockMovement } from "../src/index.js";

import { canUseBetterSqlite } from "@internal/test-harness";

describe.skipIf(!canUseBetterSqlite())("stock-movement drizzle integration", () => {
  let harness: HclHarness;

  afterEach(() => {
    harness?.close();
  });

  it("appends multi-lot movements and verifies chains", async () => {
    harness = setupHclSqlite("stk");
    const stock = createStockMovement({ store: harness.store });
    const locationId = "loc-wh-a";

    await stock.append({
      locationId,
      lotId: "LOT-1",
      ownerId: "SKU-1",
      openingBalance: "0",
      inAmount: "100",
      entryType: "receipt",
      entryTypeId: "gr-1",
    });
    await stock.append({
      locationId,
      lotId: "LOT-2",
      ownerId: "SKU-1",
      openingBalance: "0",
      inAmount: "50",
      entryType: "receipt",
      entryTypeId: "gr-2",
    });
    await stock.append({
      locationId,
      lotId: "LOT-1",
      ownerId: "SKU-1",
      outAmount: "30",
      entryType: "issue",
      entryTypeId: "gi-1",
    });

    const snap1 = await stock.snapshot({
      locationId,
      lotId: "LOT-1",
      ownerId: "SKU-1",
    });
    const snap2 = await stock.snapshot({
      locationId,
      lotId: "LOT-2",
      ownerId: "SKU-1",
    });
    expect(snap1?.balance).toBe("70");
    expect(snap2?.balance).toBe("50");

    expect(
      (
        await stock.verify({
          locationId,
          lotId: "LOT-1",
          ownerId: "SKU-1",
        })
      ).ok,
    ).toBe(true);
    expect(
      (
        await stock.verify({
          locationId,
          lotId: "LOT-2",
          ownerId: "SKU-1",
        })
      ).ok,
    ).toBe(true);
  });
});
