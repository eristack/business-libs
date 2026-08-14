import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import type { LedgerEntryStore } from "@eristack/hash-chained-ledger";
import {
  createFinancialLedger,
  type FinancialLedger,
} from "../../core/create-financial-ledger.js";

export type CreateIndexedDbFinancialLedgerStoresOptions = {
  dbName?: string;
};

export function createIndexedDbFinancialLedgerStores(
  options: CreateIndexedDbFinancialLedgerStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  ledger: LedgerEntryStore;
  financialLedger: FinancialLedger;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  const ledger = createBackseatLedgerStore({ store: backseatStore });
  const financialLedger = createFinancialLedger({ store: ledger });
  return { backseatStore, ledger, financialLedger };
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
