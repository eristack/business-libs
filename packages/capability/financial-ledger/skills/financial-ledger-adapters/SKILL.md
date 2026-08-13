---
name: financial-ledger-adapters
description: >
  @eristack/financial-ledger/drizzle: createHashChainedLedgerTables +
  createDrizzleLedgerStore for durable GL chains on Postgres (Vercel).
metadata:
  type: adapter
  library: "@eristack/financial-ledger"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/financial-ledger/docs/getting-started.md"
---

# Financial ledger adapters

```ts
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/financial-ledger/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const store = createDrizzleLedgerStore({ db, tables });
```
