import { describe, expect, it } from "vitest";
import {
  createMemoryLayerStore,
  createValuationEngine,
  issueFromLayers,
  receiveIntoLayers,
} from "../src/index.js";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";

describe("valuations methods", () => {
  it("fifo issues oldest layer first", () => {
    const received = receiveIntoLayers({
      layers: [],
      method: "fifo",
      qty: "10",
      unitCost: "2",
      currency: "USD",
      receivedAt: "2026-01-01T00:00:00.000Z",
      layerId: "a",
    });
    const received2 = receiveIntoLayers({
      layers: received.layers,
      method: "fifo",
      qty: "10",
      unitCost: "3",
      currency: "USD",
      receivedAt: "2026-02-01T00:00:00.000Z",
      layerId: "b",
    });
    const issued = issueFromLayers({
      layers: received2.layers,
      method: "fifo",
      qty: "12",
    });
    expect(issued.totalCost).toBe("26"); // 10*2 + 2*3
    expect(issued.picks[0]?.layerId).toBe("a");
  });

  it("moving average updates unit cost", () => {
    const a = receiveIntoLayers({
      layers: [],
      method: "movingAverage",
      qty: "10",
      unitCost: "2",
      currency: "USD",
      receivedAt: "2026-01-01T00:00:00.000Z",
      layerId: "avg",
    });
    const b = receiveIntoLayers({
      layers: a.layers,
      method: "movingAverage",
      qty: "10",
      unitCost: "4",
      currency: "USD",
      receivedAt: "2026-02-01T00:00:00.000Z",
      layerId: "avg",
    });
    expect(b.averageUnitCost).toBe("3");
  });
});

describe("valuation engine + ledger", () => {
  it("posts qty and value chains", async () => {
    const engine = createValuationEngine({
      method: "fifo",
      ledger: { store: createMemoryLedgerStore() },
      layers: createMemoryLayerStore(),
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
    const ok = await engine.verify(key);
    expect(ok).toEqual({ qty: true, value: true });
  });

  it("crossCheckValuationChains verifies many keys", async () => {
    const { crossCheckValuationChains } = await import("../src/core/cross-check.js");
    const engine = createValuationEngine({
      method: "fifo",
      ledger: { store: createMemoryLedgerStore() },
      layers: createMemoryLayerStore(),
    });
    const keyA = { productId: "SKU-A", currency: "USD" };
    const keyB = { productId: "SKU-B", currency: "USD" };
    await engine.receive({
      key: keyA,
      qty: "5",
      unitCost: "2",
      entryTypeId: "po-a",
      layerId: "la",
    });
    await engine.receive({
      key: keyB,
      qty: "3",
      unitCost: "4",
      entryTypeId: "po-b",
      layerId: "lb",
    });
    const report = await crossCheckValuationChains(engine, [keyA, keyB]);
    expect(report.size).toBe(2);
    expect([...report.values()].every((r) => r.ok)).toBe(true);
  });
});
