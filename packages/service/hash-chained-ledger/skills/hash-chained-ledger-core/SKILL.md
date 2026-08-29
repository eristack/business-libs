---
name: hash-chained-ledger-core
description: >
  Pure @eristack/hash-chained-ledger: createHashChainedLedger with Drizzle store
  by default, append/snapshot/verify, balance equation, SHA-256 chain. Memory
  store is unit tests only.
metadata:
  type: core
  library: "@eristack/hash-chained-ledger"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/service/hash-chained-ledger/docs/getting-started.md"
---

# Hash-chained ledger core

```ts
const tables = createHashChainedLedgerTables("pgsql");
const ledger = createHashChainedLedger({
  store: createDrizzleLedgerStore({ db, tables }),
});
await ledger.append({ chainId, openingBalance: "0", inAmount: "10", entryType, entryTypeId });
await ledger.verify(chainId);
```

Do **not** default to `createMemoryLedgerStore` in apps (Vercel-unsafe).

## Testing / tamper recipes

```ts
import {
  createMemoryLedgerStore,
  tamperHclClosingBalance,
} from "@eristack/hash-chained-ledger/testing";

const store = createMemoryLedgerStore();
// … append entries …
await tamperHclClosingBalance(store, chainId, 0, "999"); // verify must fail
```

Batch appends should share one DB transaction in production — see [hashing.md](../docs/hashing.md) § batch semantics.
