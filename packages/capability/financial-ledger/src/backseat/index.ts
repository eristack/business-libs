import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import {
  createFinancialLedger,
  type FinancialLedger,
} from "../core/create-financial-ledger.js";

export function createBackseatFinancialLedgerStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  ledger: LedgerEntryStore;
  financialLedger: FinancialLedger;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  const ledger = createBackseatLedgerStore({ store: backseatStore });
  const financialLedger = createFinancialLedger({ store: ledger });
  return { backseatStore, ledger, financialLedger };
}

export {
  registerFinancialLedgerBackseat,
  createBackseatLedgerStore,
} from "./register.js";
export type { RegisterFinancialLedgerBackseatOptions } from "./register.js";
