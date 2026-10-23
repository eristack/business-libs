import { describe, expect, it, afterEach } from "vitest";
import {
  createDrizzleLayerStore,
  createValuationLayerTables,
} from "../src/drizzle/index.js";
import { createValuationEngine, type ValuationMethod } from "../src/index.js";
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

type DrizzleEngineCtx = {
  engine: ReturnType<typeof createValuationEngine>;
  hcl: HclHarness;
  layerDb: ReturnType<typeof createTestSqliteDb>;
  key: { productId: string; lotId: string; currency: string };
};

function createDrizzleEngine(method: ValuationMethod): DrizzleEngineCtx {
  const hcl = setupHclSqlite(`val_${method}`);
  const layerDb = createTestSqliteDb();
  execSql(layerDb.sqlite, LAYER_DDL);

  const layerTable = createValuationLayerTables("sqlite", "val");
  const layers = createDrizzleLayerStore({
    db: layerDb.db,
    table: layerTable,
  });

  const engine = createValuationEngine({
    method,
    ledger: { store: hcl.store },
    layers,
  });

  const key = { productId: "SKU-1", lotId: "L1", currency: "USD" };
  return { engine, hcl, layerDb, key };
}

describe.skipIf(!canUseBetterSqlite())("valuations drizzle integration", () => {
  const open: DrizzleEngineCtx[] = [];

  afterEach(() => {
    while (open.length > 0) {
      const ctx = open.pop()!;
      ctx.hcl.close();
      ctx.layerDb.close();
    }
  });

  function track(method: ValuationMethod) {
    const ctx = createDrizzleEngine(method);
    open.push(ctx);
    return ctx;
  }

  async function assertChains(
    engine: DrizzleEngineCtx["engine"],
    key: DrizzleEngineCtx["key"],
  ) {
    expect(await engine.verify(key)).toEqual({ qty: true, value: true });
  }

  it("fifo persists layers and posts qty/value chains via Drizzle", async () => {
    const { engine, key } = track("fifo");

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
    await assertChains(engine, key);
  });

  it("lifo issues newest layer first through Drizzle stores", async () => {
    const { engine, key } = track("lifo");

    await engine.receive({
      key,
      qty: "10",
      unitCost: "2",
      entryTypeId: "po-1",
      layerId: "layer-a",
      receivedAt: "2026-01-01T00:00:00.000Z",
    });
    await engine.receive({
      key,
      qty: "10",
      unitCost: "3",
      entryTypeId: "po-2",
      layerId: "layer-b",
      receivedAt: "2026-02-01T00:00:00.000Z",
    });

    const issued = await engine.issue({ key, qty: "5", entryTypeId: "so-1" });
    expect(issued.result.totalCost).toBe("15");
    expect(issued.result.picks[0]?.layerId).toBe("layer-b");
    await assertChains(engine, key);
  });

  it("movingAverage blends cost on a single Drizzle layer row set", async () => {
    const { engine, key } = track("movingAverage");

    await engine.receive({
      key,
      qty: "10",
      unitCost: "2",
      entryTypeId: "po-1",
      layerId: "avg",
      receivedAt: "2026-01-01T00:00:00.000Z",
    });
    await engine.receive({
      key,
      qty: "10",
      unitCost: "4",
      entryTypeId: "po-2",
      layerId: "avg",
      receivedAt: "2026-02-01T00:00:00.000Z",
    });

    const issued = await engine.issue({ key, qty: "5", entryTypeId: "so-1" });
    expect(issued.result.totalCost).toBe("15");
    await assertChains(engine, key);
  });

  it("fefo respects expiresAt with Drizzle layer persistence", async () => {
    const { engine, key } = track("fefo");

    await engine.receive({
      key,
      qty: "10",
      unitCost: "2",
      entryTypeId: "po-1",
      layerId: "layer-a",
      receivedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-06-01T00:00:00.000Z",
    });
    await engine.receive({
      key,
      qty: "10",
      unitCost: "3",
      entryTypeId: "po-2",
      layerId: "layer-b",
      receivedAt: "2026-02-01T00:00:00.000Z",
      expiresAt: "2026-03-01T00:00:00.000Z",
    });

    const issued = await engine.issue({ key, qty: "11", entryTypeId: "so-1" });
    expect(issued.result.picks[0]?.layerId).toBe("layer-b");
    expect(issued.result.totalCost).toBe("32");
    await assertChains(engine, key);
  });
});
