import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import type { LedgerEntryStore } from "../core/types.js";
import { createBackseatLedgerStore } from "./ledger-store.js";

export function createBackseatHashChainedLedgerStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  ledger: LedgerEntryStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    ledger: createBackseatLedgerStore({ store: backseatStore }),
  };
}

export {
  registerHashChainedLedgerBackseat,
  createBackseatLedgerStore,
  HASH_CHAINED_LEDGER_COLLECTIONS,
} from "./register.js";
export type { RegisterHashChainedLedgerBackseatOptions } from "./register.js";
export type { CreateBackseatLedgerStoreOptions } from "./ledger-store.js";
