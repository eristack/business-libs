---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/stock-movement/backseat`, `@eristack/stock-movement/backseat/store` |
| Factories | `createBackseatStockMovementStores()` / `createIndexedDbStockMovementStores({ dbName })` — includes hash-chained ledger store |
| Register | `registerStockMovementBackseat(api, { movement?, basePath? })` |
| Default `basePath` | `/stock-movement` |
