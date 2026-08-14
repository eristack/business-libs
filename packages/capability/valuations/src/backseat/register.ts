import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createValuationEngine,
  type ValuationEngine,
  type ValuationKey,
} from "../core/create-valuations.js";
import type { ValuationMethod } from "../core/methods.js";
import { createBackseatLayerStore } from "./layer-store.js";

export type RegisterValuationsBackseatOptions = {
  basePath?: string;
  method: ValuationMethod;
  engine?: ValuationEngine;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerValuationsBackseat(
  api: Backseat,
  options: RegisterValuationsBackseatOptions,
): ValuationEngine {
  const ledgerStore = createBackseatLedgerStore({ store: api.store });
  const layers = createBackseatLayerStore(api.store);
  const engine =
    options.engine ??
    createValuationEngine({
      method: options.method,
      ledger: { store: ledgerStore },
      layers,
    });
  const base = normalizeBasePath(options.basePath ?? "/valuations");

  api.registerRoute({
    method: "POST",
    path: `${base}/receive`,
    name: "valuations.receive",
    handler: async (ctx) => {
      const body = ctx.json<{
        key: ValuationKey;
        qty: string;
        unitCost: string;
        entryTypeId: string;
      }>();
      const result = await engine.receive(body);
      return { status: 201, body: result };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/issue`,
    name: "valuations.issue",
    handler: async (ctx) => {
      const body = ctx.json<{
        key: ValuationKey;
        qty: string;
        entryTypeId: string;
      }>();
      const result = await engine.issue(body);
      return { status: 200, body: result };
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/layers`,
    name: "valuations.layers",
    handler: async (ctx) => {
      const productId = ctx.query("productId");
      const currency = ctx.query("currency");
      const lotId = ctx.query("lotId");
      if (!productId || !currency) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "productId and currency required",
            },
          },
        };
      }
      const layers = await engine.layers({
        productId,
        currency,
        lotId,
      });
      return { status: 200, body: layers };
    },
  });

  return engine;
}

export { createBackseatLayerStore } from "./layer-store.js";
export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
export { VALUATIONS_COLLECTIONS, layerDocId } from "./collections.js";
