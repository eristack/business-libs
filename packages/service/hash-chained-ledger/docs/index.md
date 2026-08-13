---
title: Overview
description: Append-only hash-chained ledger building block
sidebar_position: 1
---

# @eristack/hash-chained-ledger

Service-layer **append-only ledger** with a cryptographic hash chain. Stock
movement, financial GL, and valuations all specialize this package.

## What every entry carries

| Field | Role |
| --- | --- |
| `openingBalance` | Balance before this entry |
| `inAmount` | Increase |
| `outAmount` | Decrease |
| `adjustment` | Signed correction |
| `closingBalance` | `opening + in − out + adjustment` |
| `entryType` / `entryTypeId` | Business kind + source document id |
| `prevHash` / `entryHash` | SHA-256 chain links |
| `sequence` | 1-based order within `chainId` |
| `meta` | Optional domain extras (hashed) |

## Default persistence = database

```ts
import { createHashChainedLedger } from "@eristack/hash-chained-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/hash-chained-ledger/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const ledger = createHashChainedLedger({
  store: createDrizzleLedgerStore({ db, tables }),
});
```

`createMemoryLedgerStore` exists for **unit tests only**. Do not use it as the
app default — especially not on Vercel (no shared process memory).

## Capabilities on top

| Package | Specialization |
| --- | --- |
| `@eristack/stock-movement` | locationId + lotId qty |
| `@eristack/financial-ledger` | accountId + Money |
| `@eristack/valuations` | cost methods + qty/value chains |

## Next

- [Getting started](./getting-started.md)
- [Concepts](./concepts.md)
- [Hashing & tamper](./hashing.md)
- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
