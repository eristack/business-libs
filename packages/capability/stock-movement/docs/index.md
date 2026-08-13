---
title: Overview
description: Hash-chained inventory quantity by location and lot
---

# @eristack/stock-movement

Inventory **quantity** ledger on `@eristack/hash-chained-ledger`. Each stream is
keyed by **location + lot** (+ optional opaque `ownerId`). Locations are
**composable** — your app decides the dimensions (warehouse, bin, machine, …).

## Default = Drizzle

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

const locationId = await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "machineId", value: "CNC-1" },
]);
```

## What it adds over the base ledger

| Concern | Stock movement |
| --- | --- |
| Keys | `locationId`, `lotId`, optional `ownerId` |
| Amounts | Quantity decimal strings |
| Locations | `locationIdFromParts` → stable id |
| Integrity | Same hash chain + snapshot APIs |

Owner is **just a field** — not an ACL model.

## Next

- [Getting started](./getting-started.md)
- [Locations](./locations.md)
- [Concepts](./concepts.md)
- [Recipes](./recipes.md)
