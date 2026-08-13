import type { CostLayer } from "./methods.js";
import type { LayerStore, ValuationKey } from "./create-valuations.js";

/** Unit tests / local scratch only. Apps use Drizzle layer store. */
export function createMemoryLayerStore(): LayerStore {
  const map = new Map<string, CostLayer[]>();
  const idOf = (key: ValuationKey) =>
    `${key.productId}:${key.lotId ?? "_"}:${key.currency}`;
  return {
    async get(key) {
      return [...(map.get(idOf(key)) ?? [])];
    },
    async set(key, layers) {
      map.set(idOf(key), layers);
    },
  };
}
