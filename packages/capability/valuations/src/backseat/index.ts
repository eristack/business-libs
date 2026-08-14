import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import type { LayerStore } from "../core/create-valuations.js";
import { createBackseatLayerStore } from "./layer-store.js";

export function createBackseatValuationsStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  ledger: LedgerEntryStore;
  layers: LayerStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    ledger: createBackseatLedgerStore({ store: backseatStore }),
    layers: createBackseatLayerStore(backseatStore),
  };
}

export {
  registerValuationsBackseat,
  createBackseatLayerStore,
  createBackseatLedgerStore,
  VALUATIONS_COLLECTIONS,
  layerDocId,
} from "./register.js";
export type { RegisterValuationsBackseatOptions } from "./register.js";
