---
title: Backseat adapter
description: Package-unique defaults — full Backseat matrix in ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical Backseat guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/epoch/backseat`, `@eristack/epoch/backseat/store` |
| Factories | `createBackseatEpochStores()` / `createIndexedDbEpochStores({ dbName })` |
| Register | `registerEpochBackseat(api, { epoch?, basePath?, defaultIncrement? })` |
| Default `basePath` | `/epoch` |
| Collection | `epoch.counters` |

Wiring example: [Getting started — Backseat](./getting-started.md#backseat-prototype).
