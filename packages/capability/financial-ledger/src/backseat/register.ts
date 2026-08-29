import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createFinancialLedger,
  type FinancialLedger,
  type FinancialPostInput,
} from "../core/create-financial-ledger.js";
import { createFinancialLedgerRoutes } from "./ledger-routes.js";

export type RegisterFinancialLedgerBackseatOptions = {
  basePath?: string;
  ledger?: FinancialLedger;
};

export function registerFinancialLedgerBackseat(
  api: Backseat,
  options: RegisterFinancialLedgerBackseatOptions = {},
): FinancialLedger {
  const ledger =
    options.ledger ??
    createFinancialLedger({
      store: createBackseatLedgerStore({ store: api.store }),
    });

  registerMountedRoutes(
    api,
    options.basePath ?? "/financial-ledger",
    createFinancialLedgerRoutes(ledger),
  );

  api.registerAction("financialLedger.post", async ({ input }) =>
    ledger.post(input as FinancialPostInput),
  );

  return ledger;
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
