import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createValuationEngine,
  type ValuationEngine,
} from "../core/create-valuations.js";
import type { ValuationMethod } from "../core/methods.js";
import { createBackseatLayerStore } from "./layer-store.js";
import { createValuationRoutes } from "./valuation-routes.js";

export type RegisterValuationsBackseatOptions = {
  basePath?: string;
  method: ValuationMethod;
  engine?: ValuationEngine;
};

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

  registerMountedRoutes(
    api,
    options.basePath ?? "/valuations",
    createValuationRoutes(engine),
  );

  return engine;
}

export { createBackseatLayerStore } from "./layer-store.js";
export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
export { VALUATIONS_COLLECTIONS, layerDocId } from "./collections.js";
