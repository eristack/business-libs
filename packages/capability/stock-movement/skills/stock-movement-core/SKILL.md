---
name: stock-movement-core
description: >
  @eristack/stock-movement: locationIdFromParts, createStockMovement
  append/snapshot/verify on hash-chained qty ledger (lotId, optional ownerId).
  Default store is Drizzle — never createMemoryLedgerStore in apps.
metadata:
  type: core
  library: "@eristack/stock-movement"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/stock-movement/docs/concepts.md"
  - "eristack/business-libs:packages/capability/stock-movement/docs/getting-started.md"
---

# Stock movement core

Quantity ledger on `@eristack/hash-chained-ledger`. Chain key:
`stock:{locationId}:{lotId}:{ownerId|_}`.

```ts
import { createStockMovement, locationIdFromParts } from "@eristack/stock-movement";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/stock-movement/drizzle";

const stock = createStockMovement({
  store: createDrizzleLedgerStore({
    db,
    tables: createHashChainedLedgerTables("pgsql"),
  }),
});

const locationId = await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "machineId", value: "CNC-1" },
]);

await stock.append({
  locationId,
  lotId: "LOT-1",
  openingBalance: "0",
  inAmount: "100",
  entryType: "receipt",
  entryTypeId: "gr-1",
});
await stock.verify({ locationId, lotId: "LOT-1" });
```

`createMemoryLedgerStore` is unit tests / demos only — not the Vercel default.
