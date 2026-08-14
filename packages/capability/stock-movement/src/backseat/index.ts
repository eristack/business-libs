import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import { createStockMovement, type StockMovement } from "../core/create-stock-movement.js";

export function createBackseatStockMovementStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  ledger: LedgerEntryStore;
  movement: StockMovement;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  const ledger = createBackseatLedgerStore({ store: backseatStore });
  const movement = createStockMovement({ store: ledger });
  return { backseatStore, ledger, movement };
}

export {
  registerStockMovementBackseat,
  createBackseatLedgerStore,
} from "./register.js";
export type { RegisterStockMovementBackseatOptions } from "./register.js";
