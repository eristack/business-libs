---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/pbac/backseat`, `@eristack/pbac/backseat/store` |
| Factories | `createBackseatPbacContext()` / `createIndexedDbPbacContext({ dbName })` |
| Register | `registerPbacBackseat(api, { pbac, basePath? })` |
| Default `basePath` | `/pbac` |
