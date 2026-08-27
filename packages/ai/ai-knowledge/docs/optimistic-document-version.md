---
title: Optimistic document version
description: expectedVersion + 409 CONFLICT_VERSION — distinct from epoch cache
sidebar_position: 6
---

# Optimistic document version (expectedVersion)

**Canonical pattern** for ERP document aggregates (job, cost sheet, invoice). **Not** a package — app-owned `version` column + handler check. Distinct from `@eristack/epoch` (cache invalidation only).

Load: `@eristack/ai-knowledge#optimistic-document-version`.

---

## Rule

Every mutable aggregate carries integer `version` (starts at `1`). Commands include `expectedVersion`. Mismatch → **409 `CONFLICT_VERSION`**.

| Mechanism | Purpose |
| --- | --- |
| `version` + `expectedVersion` | Write conflict (two editors) |
| `@eristack/epoch` | TanStack Query cache freshness |

---

## HTTP envelope

```json
{ "error": { "code": "CONFLICT_VERSION", "message": "Job was modified by another user" } }
```

Backseat helpers:

```ts
import { jsonError, versionConflict, BackseatVersionConflictError } from "@eristack/backseat";

return versionConflict("Job was modified");
throw new BackseatVersionConflictError("Job was modified");
```

---

## Drizzle / SQL

```sql
UPDATE jobs SET status = $1, version = version + 1
WHERE id = $2 AND version = $3 RETURNING *;
```

Zero rows → 409. Never UPDATE without `WHERE version = expected`.

---

## Related

- [@eristack/backseat](/docs/backseat/api-reference) — `jsonError`, `versionConflict`
- [Document-with-lines ERP](./document-lines-erp.md)
