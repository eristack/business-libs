---
title: Backseat adapter
description: Wire @eristack/abac into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/abac/backseat` — `createBackseatAbacContext()`, `registerAbacBackseat()`
- `@eristack/abac/backseat/store` — `createIndexedDbAbacContext()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: (policies are code-registered).

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatAbacContext } from "@eristack/abac/backseat";
import { registerAbacBackseat } from "@eristack/abac/backseat";

const { backseatStore, ...stores } = createBackseatAbacContext();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerAbacBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbAbacContext({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
