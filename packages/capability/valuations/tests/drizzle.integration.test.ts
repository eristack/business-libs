import { describe, expect, it, afterEach } from "vitest";
import {
  createDrizzleLayerStore,
  createValuationLayerTables,
} from "../src/drizzle/index.js";
import { createValuationEngine } from "../src/index.js";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { setupHclSqlite, type HclHarness } from "@eristack/hash-chained-ledger/testing";

const LAYER_DDL = [
  `CREATE TABLE val_cost_layers (
    key_id TEXT NOT NULL,
    id TEXT NOT NULL,
    qty TEXT NOT NULL,
    unit_cost_amount TEXT NOT NULL,
    currency TEXT NOT NULL,
    received_at TEXT NOT NULL,
    expires_at TEXT,
    sort INTEGER NOT NULL
  )`,
];

describe.skipIf(!canUseBetterSqlite())("valuations drizzle integration", () => {
  let hcl: HclHarness;
  let layerDb: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    hcl?.close();
    layerDb?.close();
  });

  it("persists layers and posts qty/value chains via Drizzle", async () => {
    hcl = setupHclSqlite("val");
    layerDb = createTestSqliteDb();
    execSql(layerDb.sqlite, LAYER_DDL);

    const layerTable = createValuationLayerTables("sqlite", "val");
    const layers = createDrizzleLayerStore({
      db: layerDb.db,
      table: layerTable,
    });

    const engine = createValuationEngine({
      method: "fifo",
      ledger: { store: hcl.store },
      layers,
    });

    const key = { productId: "SKU-1", lotId: "L1", currency: "USD" };
    await engine.receive({
      key,
      qty: "10",
      unitCost: "5",
      entryTypeId: "po-1",
      layerId: "layer-1",
    });
    const issued = await engine.issue({
      key,
      qty: "4",
      entryTypeId: "so-1",
    });

    expect(issued.result.totalCost).toBe("20");
    const stored = await engine.layers(key);
    expect(stored).toHaveLength(1);
    expect(stored[0]?.qty).toBe("6");

    const ok = await engine.verify(key);
    expect(ok).toEqual({ qty: true, value: true });
  });
});
