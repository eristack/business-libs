---
title: Getting started
description: Compose a location and post receipts/issues
---

# Getting started

```bash
pnpm add @eristack/stock-movement
pnpm add @eristack/hash-chained-ledger drizzle-orm
```

## Wire the store (required default)

```ts
import { createStockMovement, locationIdFromParts } from "@eristack/stock-movement";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/stock-movement/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const stock = createStockMovement({
  store: createDrizzleLedgerStore({ db, tables }),
});
```

## Compose location

```ts
const locationId = await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "zoneId", value: "Z-2" },
  { key: "machineId", value: "CNC-1" },
]);
// Order of parts does not matter — keys are sorted before hashing.
```

## Post movements

```ts
await stock.append({
  locationId,
  lotId: "LOT-1",
  ownerId: "SKU-9", // opaque; optional
  openingBalance: "0",
  inAmount: "100",
  entryType: "receipt",
  entryTypeId: "gr-1",
});

await stock.append({
  locationId,
  lotId: "LOT-1",
  ownerId: "SKU-9",
  outAmount: "40",
  entryType: "issue",
  entryTypeId: "gi-1",
});

const snap = await stock.snapshot({
  locationId,
  lotId: "LOT-1",
  ownerId: "SKU-9",
});
// snap.balance === "60"

await stock.verify({ locationId, lotId: "LOT-1", ownerId: "SKU-9" });
```

Unit tests may import `createMemoryLedgerStore` from
`@eristack/hash-chained-ledger` — never as the deployed default.
