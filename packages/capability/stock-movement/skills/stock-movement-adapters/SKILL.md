---
name: stock-movement-adapters
description: >
  @eristack/stock-movement/drizzle: re-exports createHashChainedLedgerTables +
  createDrizzleLedgerStore for Postgres on Vercel. Use as the app default store.
metadata:
  type: adapter
  library: "@eristack/stock-movement"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/stock-movement/docs/getting-started.md"
---

# Stock movement adapters

```ts
import { createStockMovement } from "@eristack/stock-movement";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/stock-movement/drizzle";

const tables = createHashChainedLedgerTables("pgsql");
const store = createDrizzleLedgerStore({ db, tables });
const movement = createStockMovement({ store });

await movement.append({
  locationId: locationIdFromParts({ warehouseId: "wh1", binId: "a1" }),
  lotId: "lot-1",
  quantityDelta: "10",
});
```

Dialects: `"pgsql"` (prod), `"mysql"`, `"sqlite"` (real file for local/tests —
still not an in-memory Map).
