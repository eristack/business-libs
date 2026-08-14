---
title: Backseat adapter
description: Wire @eristack/pbac into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/pbac/backseat` — `createBackseatPbacContext()`, `registerPbacBackseat()`
- `@eristack/pbac/backseat/store` — `createIndexedDbPbacContext()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: (policies are code-registered).

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatPbacContext } from "@eristack/pbac/backseat";
import { registerPbacBackseat } from "@eristack/pbac/backseat";

const { backseatStore, ...stores } = createBackseatPbacContext();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerPbacBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbPbacContext({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
