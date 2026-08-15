---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/rbac/backseat`, `@eristack/rbac/backseat/store` |
| Factories | `createBackseatRbacStores()` / `createIndexedDbRbacStores({ dbName })` |
| Register | `registerRbacBackseat(api, RbacConfig & { rbac?, basePath? })` |
| Default `basePath` | `/rbac` |
| Collections | `rbac.roles`, `rbac.grants` |
