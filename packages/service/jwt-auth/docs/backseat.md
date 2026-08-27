---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/jwt-auth/backseat`, `@eristack/jwt-auth/backseat/store` |
| Factories | `createBackseatJwtAuthStores()` / `createIndexedDbJwtAuthStores({ dbName })` |
| Register | `registerJwtAuthBackseat(api, RestAuthConfig & { basePath?, paths? })` |
| Default `basePath` | `/auth` |
| Collections | `jwtAuth.credentials`, `jwtAuth.refreshTokens` |

**Horizon A → B:** same paths as Express — see [Dual-target auth client](./dual-target.md).
