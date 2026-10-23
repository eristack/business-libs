---
name: hash-chained-ledger-adapters
description: >
  @eristack/hash-chained-ledger/drizzle: createHashChainedLedgerTables +
  createDrizzleLedgerStore. Use for durable chains on Postgres (Vercel).
metadata:
  type: adapter
  library: "@eristack/hash-chained-ledger"
  library_version: "0.0.0"
sources:
  - packages/service/hash-chained-ledger/docs/adapters.md
---

# Hash-chained ledger adapters

```ts
const tables = createHashChainedLedgerTables("pgsql");
const store = createDrizzleLedgerStore({ db, tables });
```

Entries table ships **UNIQUE `(chain_id, sequence)`** — `append()` retries on contention. Migrate existing apps with `{prefix}_entries_chain_seq_uq`.
