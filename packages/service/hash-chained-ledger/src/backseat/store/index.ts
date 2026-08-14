import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import type { LedgerEntryStore } from "../../core/types.js";
import { createBackseatLedgerStore } from "../ledger-store.js";

export type CreateIndexedDbHashChainedLedgerStoresOptions = {
  dbName?: string;
};

/** Browser default — IndexedDB-backed ledger store via Backseat. */
export function createIndexedDbHashChainedLedgerStores(
  options: CreateIndexedDbHashChainedLedgerStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  ledger: LedgerEntryStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    ledger: createBackseatLedgerStore({ store: backseatStore }),
  };
}

export { createBackseatLedgerStore } from "../ledger-store.js";
export { HASH_CHAINED_LEDGER_COLLECTIONS } from "../collections.js";
export type { CreateBackseatLedgerStoreOptions } from "../ledger-store.js";
