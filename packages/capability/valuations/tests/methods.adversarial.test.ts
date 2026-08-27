import { describe, expect, it } from "vitest";
import {
  issueFromLayers,
  receiveIntoLayers,
  type ValuationMethod,
} from "../src/index.js";

const ALL_METHODS: ValuationMethod[] = [
  "fifo",
  "lifo",
  "fefo",
  "hifo",
  "lofo",
  "movingAverage",
  "weightedAverage",
  "standardCost",
  "specificIdentification",
];

function receivePair(method: ValuationMethod) {
  const first = receiveIntoLayers({
    layers: [],
    method,
    qty: "10",
    unitCost: "2",
    currency: "USD",
    receivedAt: "2026-01-01T00:00:00.000Z",
    layerId: "layer-a",
    expiresAt: method === "fefo" ? "2026-06-01T00:00:00.000Z" : undefined,
    standardUnitCost: method === "standardCost" ? "2.50" : undefined,
  });
  const second = receiveIntoLayers({
    layers: first.layers,
    method,
    qty: "10",
    unitCost: "3",
    currency: "USD",
    receivedAt: "2026-02-01T00:00:00.000Z",
    layerId: method === "movingAverage" || method === "weightedAverage" ? "layer-a" : "layer-b",
    expiresAt: method === "fefo" ? "2026-03-01T00:00:00.000Z" : undefined,
    standardUnitCost: method === "standardCost" ? "2.50" : undefined,
  });
  return second.layers;
}

describe("valuation methods adversarial", () => {
  it.each(ALL_METHODS)("receive + issue for %s", (method) => {
    const layers = receivePair(method);
    const issueInput =
      method === "specificIdentification"
        ? { layers, method, qty: "5", layerId: "layer-a" }
        : { layers, method, qty: "5" };
    const issued = issueFromLayers(issueInput);
    expect(Number(issued.totalCost)).toBeGreaterThan(0);
    expect(issued.picks.length).toBeGreaterThan(0);
  });

  it.each(ALL_METHODS.filter((m) => m !== "specificIdentification"))(
    "issue more than available throws for %s",
    (method) => {
      const layers = receiveIntoLayers({
        layers: [],
        method,
        qty: "3",
        unitCost: "1",
        currency: "USD",
        receivedAt: "2026-01-01T00:00:00.000Z",
        layerId: "only",
        expiresAt: method === "fefo" ? "2026-06-01T00:00:00.000Z" : undefined,
      }).layers;

      expect(() =>
        issueFromLayers({ layers, method, qty: "100" }),
      ).toThrow(/Insufficient/);
    },
  );

  it("fefo receive requires expiresAt", () => {
    expect(() =>
      receiveIntoLayers({
        layers: [],
        method: "fefo",
        qty: "1",
        unitCost: "1",
        currency: "USD",
        receivedAt: "2026-01-01T00:00:00.000Z",
        layerId: "x",
      }),
    ).toThrow(/fefo receive requires expiresAt/);
  });

  it("fefo issues earliest expiry first", () => {
    const layers = receivePair("fefo");
    const issued = issueFromLayers({ layers, method: "fefo", qty: "11" });
    expect(issued.picks[0]?.layerId).toBe("layer-b");
  });
});
