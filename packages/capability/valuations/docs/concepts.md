---
title: Concepts
description: Layers, dual chains, methods, stores
---

# Concepts

## Cost layers

Open receipts sit in a **layer store** (Drizzle table by default). Each layer
holds remaining qty, unit cost, received/expiry timestamps, and optional
`layerId` for specific identification.

Issues consume layers according to the configured **method** and rewrite
remaining qty (or remove empty layers).

## Dual hash chains

| Chain | Meaning |
| --- | --- |
| `val:qty:{product}:{lot}:{currency}` | Quantity in/out |
| `val:value:{product}:{lot}:{currency}` | Cost value in/out |

Both must verify (`engine.verify(key)` → `{ qty, value }`). Layer rows are the
working set for costing; chains are the append-only audit trail.

## Valuation key

```ts
{ productId: string; lotId: string; currency: string }
```

Product + lot + currency namespaces both chains and the open layers for that
SKU/lot stream.

## Engine vs pure helpers

| API | Use when |
| --- | --- |
| `createValuationEngine` | Persist layers + dual chains on every receive/issue |
| `receiveIntoLayers` / `issueFromLayers` | Pure layer math (tests, what-if) without I/O |

## Persistence (default = DB)

| Store | Role |
| --- | --- |
| `createDrizzleLedgerStore` | Hash-chained entries + snapshots |
| `createDrizzleLayerStore` | Open cost layers |

```ts
import {
  createDrizzleLedgerStore,
  createDrizzleLayerStore,
  createHashChainedLedgerTables,
  createValuationLayerTables,
} from "@eristack/valuations/drizzle";
```

`createMemoryLayerStore` / `createMemoryLedgerStore` are for Vitest and the site
hero only. Do not default to in-memory Maps on Vercel.
