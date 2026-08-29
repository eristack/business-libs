import {
  normalizeBasePath,
  registerMountedRoutes,
} from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createHashChainedLedger } from "../core/create-ledger.js";
import type {
  CreateHashChainedLedgerOptions,
  HashChainedLedger,
} from "../core/types.js";
import { createBackseatLedgerStore } from "./ledger-store.js";
import { createHashChainedLedgerRoutes } from "./ledger-routes.js";

export type RegisterHashChainedLedgerBackseatOptions = {
  basePath?: string;
  ledger?: CreateHashChainedLedgerOptions;
};

/** Register hash-chained ledger HTTP + named actions on a Backseat engine. */
export function registerHashChainedLedgerBackseat(
  api: Backseat,
  options: RegisterHashChainedLedgerBackseatOptions = {},
): HashChainedLedger {
  const ledger = createHashChainedLedger({
    store: createBackseatLedgerStore({ store: api.store }),
    ...options.ledger,
  });
  const base = normalizeBasePath(options.basePath ?? "/ledger");

  registerMountedRoutes(api, base, createHashChainedLedgerRoutes(ledger));

  api.registerAction("hashChainedLedger.append", async ({ input }) =>
    ledger.append(input as Parameters<HashChainedLedger["append"]>[0]),
  );

  return ledger;
}

export { createBackseatLedgerStore } from "./ledger-store.js";
export { HASH_CHAINED_LEDGER_COLLECTIONS } from "./collections.js";
export type { CreateBackseatLedgerStoreOptions } from "./ledger-store.js";
