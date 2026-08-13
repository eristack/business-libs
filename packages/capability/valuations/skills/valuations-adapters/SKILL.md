---
name: valuations-adapters
description: >
  @eristack/valuations/drizzle: createHashChainedLedgerTables +
  createDrizzleLedgerStore + createValuationLayerTables + createDrizzleLayerStore.
  Both stores required for production engines on Postgres (Vercel).
metadata:
  type: adapter
  library: "@eristack/valuations"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/valuations/docs/getting-started.md"
---

# Valuations adapters

```ts
import {
  createDrizzleLedgerStore,
  createDrizzleLayerStore,
  createHashChainedLedgerTables,
  createValuationLayerTables,
} from "@eristack/valuations/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const layerTable = createValuationLayerTables("pgsql");

const ledgerStore = createDrizzleLedgerStore({ db, tables });
const layers = createDrizzleLayerStore({ db, table: layerTable });
```

Need **both** entry/snapshot tables and the layer table — layers alone are not
enough for audit verify.
