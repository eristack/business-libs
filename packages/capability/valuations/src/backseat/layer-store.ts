import type { BackseatStore } from "@eristack/backseat";
import type { CostLayer } from "../core/methods.js";
import type { LayerStore, ValuationKey } from "../core/create-valuations.js";
import { VALUATIONS_COLLECTIONS, layerDocId } from "./collections.js";

export function createBackseatLayerStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): LayerStore {
  const collection = options.collection ?? VALUATIONS_COLLECTIONS.layers;

  function keyOf(key: ValuationKey): string {
    return layerDocId(key.productId, key.lotId, key.currency);
  }

  return {
    async get(key) {
      const doc = await store.get(collection, keyOf(key));
      if (!doc || !Array.isArray(doc.layers)) return [];
      return doc.layers as CostLayer[];
    },

    async set(key, layers) {
      const id = keyOf(key);
      const doc = {
        id,
        productId: key.productId,
        lotId: key.lotId ?? null,
        currency: key.currency,
        layers,
      };
      const existing = await store.get(collection, id);
      if (existing) {
        await store.update(collection, id, doc);
        return;
      }
      await store.create(collection, doc);
    },
  };
}
