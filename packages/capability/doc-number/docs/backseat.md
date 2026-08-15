---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/doc-number/backseat`, `@eristack/doc-number/backseat/store` |
| Factories | `createBackseatDocNumberStores()` / `createIndexedDbDocNumberStores({ dbName })` |
| Register | `registerDocNumberBackseat(api, RestDocNumberConfig & { basePath?, paths? })` |
| Default `basePath` | `/doc-number` |
| Collections | `docNumber.formats`, `docNumber.sequences` |
