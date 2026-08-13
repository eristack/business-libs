---
name: hash-chained-ledger-adapters
description: >
  @eristack/hash-chained-ledger/drizzle: createHashChainedLedgerTables +
  createDrizzleLedgerStore. Use for durable chains on Postgres (Vercel).
metadata:
  type: adapter
  library: "@eristack/hash-chained-ledger"
  library_version: "0.0.0"
---

# Hash-chained ledger adapters

```ts
const tables = createHashChainedLedgerTables("pgsql");
const store = createDrizzleLedgerStore({ db, tables });
```
