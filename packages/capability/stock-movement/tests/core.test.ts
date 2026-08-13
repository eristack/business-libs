import { describe, expect, it } from "vitest";
import {
  createStockMovement,
  locationIdFromParts,
} from "../src/index.js";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";

describe("stock-movement", () => {
  it("composes location and posts qty movements", async () => {
    const locationId = await locationIdFromParts([
      { key: "warehouseId", value: "WH-A" },
      { key: "machineId", value: "M-9" },
    ]);
    const same = await locationIdFromParts([
      { key: "machineId", value: "M-9" },
      { key: "warehouseId", value: "WH-A" },
    ]);
    expect(same).toBe(locationId);

    const stock = createStockMovement({ store: createMemoryLedgerStore() });
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
      lotId: "LOT-1",
      ownerId: "SKU-1",
      outAmount: "40",
      entryType: "issue",
      entryTypeId: "gi-1",
    });

    const snap = await stock.snapshot({
      locationId,
      lotId: "LOT-1",
      ownerId: "SKU-1",
    });
    expect(snap?.balance).toBe("60");
    const verified = await stock.verify({
      locationId,
      lotId: "LOT-1",
      ownerId: "SKU-1",
    });
    expect(verified.ok).toBe(true);
  });
});
