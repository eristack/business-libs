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
