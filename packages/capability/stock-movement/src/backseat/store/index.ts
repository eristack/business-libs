import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import {
  createStockMovement,
  type StockMovement,
} from "../../core/create-stock-movement.js";

export type CreateIndexedDbStockMovementStoresOptions = {
  dbName?: string;
};

export function createIndexedDbStockMovementStores(
  options: CreateIndexedDbStockMovementStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  ledger: LedgerEntryStore;
  movement: StockMovement;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  const ledger = createBackseatLedgerStore({ store: backseatStore });
  const movement = createStockMovement({ store: ledger });
  return { backseatStore, ledger, movement };
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
