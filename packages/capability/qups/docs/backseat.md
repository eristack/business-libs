---
title: Backseat adapter
description: Wire @eristack/qups into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/qups/backseat` — `createBackseatQupsStores()`, `registerQupsBackseat()`
- `@eristack/qups/backseat/store` — `createIndexedDbQupsStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: qups.profiles, qups.lines.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatQupsStores } from "@eristack/qups/backseat";
import { registerQupsBackseat } from "@eristack/qups/backseat";

const { backseatStore, ...stores } = createBackseatQupsStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerQupsBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbQupsStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
