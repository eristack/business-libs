---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/valuations/backseat`, `@eristack/valuations/backseat/store` |
| Factories | `createBackseatValuationsStores()` / `createIndexedDbValuationsStores({ dbName })` |
| Register | `registerValuationsBackseat(api, { **method**, engine?, basePath? })` — **`method` required** |
| Default `basePath` | `/valuations` |
