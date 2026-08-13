---
name: valuations-core
description: >
  @eristack/valuations: FIFO/LIFO/FEFO/HIFO/LOFO/movingAverage/weightedAverage/
  standardCost/specificIdentification with dual qty/value hash chains. Default
  stores are Drizzle ledger + Drizzle layers — memory is tests only.
metadata:
  type: core
  library: "@eristack/valuations"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/valuations/docs/concepts.md"
  - "eristack/business-libs:packages/capability/valuations/docs/methods.md"
  - "eristack/business-libs:packages/capability/valuations/docs/getting-started.md"
---

# Valuations core

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
await engine.receive({ key, qty: "10", unitCost: "5", entryTypeId: "po-1", layerId: "layer-1" });
await engine.issue({ key, qty: "4", entryTypeId: "so-1" });
await engine.verify(key);
```

`createMemoryLayerStore` / `createMemoryLedgerStore` — Vitest/demos only.
