---
title: Backseat adapter
description: Wire @eristack/stock-movement into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/stock-movement/backseat` — `createBackseatStockMovementStores()`, `registerStockMovementBackseat()`
- `@eristack/stock-movement/backseat/store` — `createIndexedDbStockMovementStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: hashChainedLedger.entries (via hash-chained-ledger).

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatStockMovementStores } from "@eristack/stock-movement/backseat";
import { registerStockMovementBackseat } from "@eristack/stock-movement/backseat";

const { backseatStore, ...stores } = createBackseatStockMovementStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerStockMovementBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbStockMovementStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
