---
title: Overview
description: Canon inventory costing with hash-chained qty and value
---

# @eristack/valuations

Product/lot **cost valuation** with open cost layers and dual hash-chained
ledgers (quantity + value). Methods: FIFO, LIFO, FEFO, HIFO, LOFO, moving /
weighted average, standard cost, specific identification.

## Default = Drizzle (entries + layers)

```ts
import { createValuationEngine } from "@eristack/valuations";
import {
  createDrizzleLedgerStore,
  createDrizzleLayerStore,
  createHashChainedLedgerTables,
  createValuationLayerTables,
} from "@eristack/valuations/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const layerTable = createValuationLayerTables("pgsql");

const engine = createValuationEngine({
  method: "fifo",
  ledger: { store: createDrizzleLedgerStore({ db, tables }) },
  layers: createDrizzleLayerStore({ db, table: layerTable }),
});
```

## Next

- [Getting started](./getting-started.md)
- [Methods](./methods.md)
- [Concepts](./concepts.md)
- [Recipes](./recipes.md)
