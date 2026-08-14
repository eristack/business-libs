import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import type { LayerStore } from "../../core/create-valuations.js";
import { createBackseatLayerStore } from "../layer-store.js";

export type CreateIndexedDbValuationsStoresOptions = {
  dbName?: string;
};

export function createIndexedDbValuationsStores(
  options: CreateIndexedDbValuationsStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  ledger: LedgerEntryStore;
  layers: LayerStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    ledger: createBackseatLedgerStore({ store: backseatStore }),
    layers: createBackseatLayerStore(backseatStore),
  };
}

export {
  createBackseatLayerStore,
  createBackseatLedgerStore,
  VALUATIONS_COLLECTIONS,
  layerDocId,
} from "../register.js";
