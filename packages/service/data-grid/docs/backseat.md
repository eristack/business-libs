---
title: Backseat adapter
description: Wire @eristack/data-grid into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/data-grid/backseat` — `createBackseatDataGridContext()`, `registerDataGridBackseat / registerDataGridBackseatRoute()`
- `@eristack/data-grid/backseat/store` — `createIndexedDbDataGridContext()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: (app collections — grid parses query only).

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatDataGridContext } from "@eristack/data-grid/backseat";
import { registerDataGridBackseat } from "@eristack/data-grid/backseat";

const { backseatStore, ...stores } = createBackseatDataGridContext();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerDataGridBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbDataGridContext({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
