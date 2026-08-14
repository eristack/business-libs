---
title: Backseat adapter
description: Wire @eristack/financial-ledger into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/financial-ledger/backseat` — `createBackseatFinancialLedgerStores()`, `registerFinancialLedgerBackseat()`
- `@eristack/financial-ledger/backseat/store` — `createIndexedDbFinancialLedgerStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: hashChainedLedger.entries.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatFinancialLedgerStores } from "@eristack/financial-ledger/backseat";
import { registerFinancialLedgerBackseat } from "@eristack/financial-ledger/backseat";

const { backseatStore, ...stores } = createBackseatFinancialLedgerStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerFinancialLedgerBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbFinancialLedgerStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
