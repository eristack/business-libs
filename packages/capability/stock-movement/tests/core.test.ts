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

  it("dedupes append when idempotencyKey repeats", async () => {
    const stock = createStockMovement({ store: createMemoryLedgerStore() });
    const base = {
      locationId: "loc-a",
      lotId: "LOT-1",
      openingBalance: "0",
      inAmount: "50",
      entryType: "receipt",
      entryTypeId: "gr-99",
      idempotencyKey: "post-gr-99",
    };
    const first = await stock.append(base);
    const second = await stock.append({
      ...base,
      inAmount: "999",
    });
    expect(second.id).toBe(first.id);
    const snap = await stock.snapshot({
      locationId: "loc-a",
      lotId: "LOT-1",
    });
    expect(snap?.balance).toBe("50");
    const entries = await stock.list({
      locationId: "loc-a",
      lotId: "LOT-1",
    });
    expect(entries).toHaveLength(1);
  });

  it("isolates chains by lot and owner", async () => {
    const stock = createStockMovement({ store: createMemoryLedgerStore() });
    await stock.append({
      locationId: "loc-b",
      lotId: "L1",
      ownerId: "SKU-A",
      openingBalance: "0",
      inAmount: "10",
      entryType: "receipt",
      entryTypeId: "a1",
    });
    await stock.append({
      locationId: "loc-b",
      lotId: "L2",
      ownerId: "SKU-A",
      openingBalance: "0",
      inAmount: "20",
      entryType: "receipt",
      entryTypeId: "a2",
    });
    const snap1 = await stock.snapshot({
      locationId: "loc-b",
      lotId: "L1",
      ownerId: "SKU-A",
    });
    const snap2 = await stock.snapshot({
      locationId: "loc-b",
      lotId: "L2",
      ownerId: "SKU-A",
    });
    expect(snap1?.balance).toBe("10");
    expect(snap2?.balance).toBe("20");
  });
});
