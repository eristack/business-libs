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
