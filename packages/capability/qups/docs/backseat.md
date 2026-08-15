---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/qups/backseat`, `@eristack/qups/backseat/store` |
| Factories | `createBackseatQupsStores()` / `createIndexedDbQupsStores({ dbName })` |
| Register | `registerQupsBackseat(api, CreateQupsOptions & { qups?, basePath? })` |
| Default `basePath` | `/qups` |
| Collections | `qups.profiles`, `qups.lines` |
