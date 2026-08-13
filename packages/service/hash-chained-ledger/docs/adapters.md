---
title: Adapters
description: Drizzle tables and store — the production default
sidebar_position: 5
---

# Adapters

## Drizzle (default)

```ts
import { createHashChainedLedger } from "@eristack/hash-chained-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/hash-chained-ledger/drizzle";

const tables = createHashChainedLedgerTables("pgsql", "hcl");
// optional second arg = table name prefix (default "hcl")

const ledger = createHashChainedLedger({
  store: createDrizzleLedgerStore({ db, tables }),
});
```

### Tables

| Table | Purpose |
| --- | --- |
| `{prefix}_entries` | Append-only rows |
| `{prefix}_snapshots` | Tip balance per chain |

App owns migrations. Prefer **Postgres (`pgsql`)** on Vercel.

### Store contract

Implement `LedgerEntryStore` if you need Redis/etc. Drizzle is the supported
path. Do **not** default to `createMemoryLedgerStore`.

## Memory (tests only)

```ts
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
```

Use in Vitest. Never in the deployed app.
