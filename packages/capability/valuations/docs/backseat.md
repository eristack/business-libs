---
title: Backseat adapter
description: Wire @eristack/valuations into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/valuations/backseat` — `createBackseatValuationsStores()`, `registerValuationsBackseat()`
- `@eristack/valuations/backseat/store` — `createIndexedDbValuationsStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: valuations.layers + ledger entries.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatValuationsStores } from "@eristack/valuations/backseat";
import { registerValuationsBackseat } from "@eristack/valuations/backseat";

const { backseatStore, ...stores } = createBackseatValuationsStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerValuationsBackseat(api, { method: "fifo" });
```

Browser: swap `createIndexedDbValuationsStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
