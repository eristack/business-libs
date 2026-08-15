---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/abac/backseat`, `@eristack/abac/backseat/store` |
| Factories | `createBackseatAbacContext()` / `createIndexedDbAbacContext({ dbName })` — policies registered in code |
| Register | `registerAbacBackseat(api, { abac, basePath? })` |
| Default `basePath` | `/abac` |
