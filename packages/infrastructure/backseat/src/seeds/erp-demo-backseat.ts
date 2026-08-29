import { createBackseat } from "../core/create-backseat.js";
import { createMemoryBackseatStore } from "../core/memory-store.js";
import type { Backseat, BackseatStore } from "../core/types.js";
import { createErpDemoSnapshot } from "./erp-demo.js";
import { registerErpDemoControllers } from "./erp-demo-controllers.js";

export type CreateErpDemoBackseatOptions = {
  /** Defaults to memory — use IndexedDB in browser prototypes. */
  store?: BackseatStore;
  baseUrl?: string;
};

/**
 * Ready-made Backseat engine: ERP demo seed + CRUD collections + PO workflow controllers.
 * Memory store by default (tests); pass `createIndexedDbBackseatStore()` for browser demos.
 */
export function createErpDemoBackseat(
  options: CreateErpDemoBackseatOptions = {},
): Backseat {
  const store = options.store ?? createMemoryBackseatStore();
  const api = createBackseat({
    store,
    baseUrl: options.baseUrl ?? "/api",
    seed: createErpDemoSnapshot,
    collections: {
      partners: {},
      products: {},
      purchaseOrders: {},
    },
  });
  registerErpDemoControllers(api);
  return api;
}
