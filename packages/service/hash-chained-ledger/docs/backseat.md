---
title: Backseat adapter
description: Wire @eristack/hash-chained-ledger into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/hash-chained-ledger/backseat` — `createBackseatHashChainedLedgerStores()`, `registerHashChainedLedgerBackseat()`
- `@eristack/hash-chained-ledger/backseat/store` — `createIndexedDbHashChainedLedgerStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: hashChainedLedger.entries, hashChainedLedger.snapshots.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatHashChainedLedgerStores } from "@eristack/hash-chained-ledger/backseat";
import { registerHashChainedLedgerBackseat } from "@eristack/hash-chained-ledger/backseat";

const { backseatStore, ...stores } = createBackseatHashChainedLedgerStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerHashChainedLedgerBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbHashChainedLedgerStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
