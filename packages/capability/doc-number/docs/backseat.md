---
title: Backseat adapter
description: Wire @eristack/doc-number into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/doc-number/backseat` — `createBackseatDocNumberStores()`, `registerDocNumberBackseat()`
- `@eristack/doc-number/backseat/store` — `createIndexedDbDocNumberStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: docNumber.formats, docNumber.sequences.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatDocNumberStores } from "@eristack/doc-number/backseat";
import { registerDocNumberBackseat } from "@eristack/doc-number/backseat";

const { backseatStore, ...stores } = createBackseatDocNumberStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerDocNumberBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbDocNumberStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
