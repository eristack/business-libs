---
title: Getting started
description: FIFO receive/issue with Postgres stores
---

# Getting started

```bash
pnpm add @eristack/valuations @eristack/hash-chained-ledger
pnpm add drizzle-orm
```

```ts
import { createValuationEngine } from "@eristack/valuations";
import {
  createDrizzleLedgerStore,
  createDrizzleLayerStore,
  createHashChainedLedgerTables,
  createValuationLayerTables,
} from "@eristack/valuations/drizzle";

const engine = createValuationEngine({
  method: "fifo",
  ledger: {
    store: createDrizzleLedgerStore({
      db,
      tables: createHashChainedLedgerTables("pgsql"),
    }),
  },
  layers: createDrizzleLayerStore({
    db,
    table: createValuationLayerTables("pgsql"),
  }),
});

const key = { productId: "SKU-1", lotId: "L1", currency: "USD" };

await engine.receive({
  key,
  qty: "10",
  unitCost: "5",
  entryTypeId: "po-1",
  layerId: "layer-1",
});

const issued = await engine.issue({
  key,
  qty: "4",
  entryTypeId: "so-1",
});
// issued.result.totalCost === "20"

await engine.verify(key); // { qty: true, value: true }
```

## Cost layer columns

`createValuationLayerTables` stores layers with **shared row `currency`** and
`unitCostAmount` (SQL `unit_cost_amount`, numeric via `@eristack/money/drizzle`).
The value hash chain still uses decimal **text** inside hashed entries — do not
change ledger SQL types.

Core API `unitCost` remains a decimal string; Drizzle maps `unitCostAmount` ↔
`CostLayer.unitCost`.

`createMemoryLayerStore` / `createMemoryLedgerStore` are for Vitest only.

---

## Method picker (production)

Pass `method` into `createValuationEngine({ method, … })`. Choose once per valuation key (product/lot/currency); switching mid-life mixes policies — prefer period close or new key.

| Method | When to use | Issue order / cost basis | Required receive fields | Required issue fields | Test coverage |
| --- | --- | --- | --- | --- | --- |
| `fifo` | Default physical pick; oldest stock first; most audit-friendly | Oldest `receivedAt` first | `qty`, `unitCost`, `currency`, `receivedAt`, `layerId` | `qty` | **Unit tested** (`receiveIntoLayers` / engine) |
| `lifo` | Tax/policy choice where newest cost hits COGS first (not auto-compliance) | Newest `receivedAt` first | Same as FIFO | `qty` | **Not unit tested** — core logic mirrors FIFO sort |
| `fefo` | Expiry-driven (F&B, pharma, chemicals) | Earliest `expiresAt`, then `receivedAt` | + **`expiresAt`** on receive | `qty` | **Not unit tested** |
| `hifo` | Intentionally maximize COGS (rare; policy-driven) | Highest `unitCost` first | Same as FIFO | `qty` | **Not unit tested** |
| `lofo` | Minimize COGS on issue (promotional / policy) | Lowest `unitCost` first | Same as FIFO | `qty` | **Not unit tested** |
| `movingAverage` | Single blended layer; smooth COGS; high transaction volume | One layer at rolling average | `qty`, `unitCost`, `currency`, `receivedAt`, `layerId` | `qty` | **Unit tested** (average update) |
| `weightedAverage` | Same engine path as moving average (perpetual weighted blend) | Same as moving average | Same as moving average | `qty` | **Not unit tested** (same code path as movingAverage) |
| `standardCost` | Fixed standard/BOM cost; variances elsewhere in GL | Issues at layer `unitCost` (standard stored on receive) | + optional **`standardUnitCost`** override | `qty` | **Not unit tested** |
| `specificIdentification` | Serial numbers, consignment, named batch pick | Exact layer by id | Same as FIFO | **`layerId`** + `qty` | **Not unit tested** |

### Quick decision

| Business need | Prefer |
| --- | --- |
| Warehouse pick matches receipt order | `fifo` |
| Sell soonest expiry | `fefo` |
| Smooth COGS, one average layer | `movingAverage` |
| Fixed BOM cost | `standardCost` |
| User picks exact batch/serial | `specificIdentification` |

### Audit note

Only **FIFO**, **movingAverage**, and **engine+ledger posting** have Vitest coverage today. Drizzle layer/ledger stores are **not integration-tested** (see package audit). Run `pnpm --filter @eristack/valuations test` before changing method ordering.

Details: [Methods](./methods.md) · Dual chains: [Concepts](./concepts.md).
