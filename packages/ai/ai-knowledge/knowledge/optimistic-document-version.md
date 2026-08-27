# Optimistic document version (expectedVersion)

**Canonical pattern** for ERP document aggregates (job, cost sheet, invoice). **Not** a package — app-owned `version` column + handler check. Distinct from `@eristack/epoch` (cache invalidation only).

Load: `@eristack/ai-knowledge#optimistic-document-version`.

---

## Rule

Every mutable aggregate carries integer `version` (starts at `1`). Commands include `expectedVersion`. Save succeeds only when stored version matches; else **409 `CONFLICT_VERSION`**.

| Mechanism | Purpose |
| --- | --- |
| `version` + `expectedVersion` | Write conflict (two editors) |
| `@eristack/epoch` | TanStack Query cache freshness |

Do not use epoch as a substitute for optimistic locking.

---

## HTTP envelope

Same shape in Backseat and Express:

```json
{ "error": { "code": "CONFLICT_VERSION", "message": "Job was modified by another user" } }
```

Backseat helpers:

```ts
import { jsonError, versionConflict, BackseatVersionConflictError } from "@eristack/backseat";

// Return from handler
return versionConflict("Job was modified");

// Or throw (caught by api.handle)
throw new BackseatVersionConflictError("Job was modified");
```

---

## Backseat handler sketch

```ts
async function patchJob(ctx) {
  const { expectedVersion, ...patch } = await ctx.json();
  const current = await ctx.store.get("jobs", ctx.params.id);
  if (!current) return jsonError({ status: 404, code: "NOT_FOUND", message: "Job not found" });
  if (Number(current.version) !== Number(expectedVersion)) {
    return versionConflict();
  }
  const next = { ...current, ...patch, version: Number(current.version) + 1 };
  await ctx.store.update("jobs", String(current.id), next);
  return ctx.json(200, next);
}
```

Use `store.atomic()` when header + child must bump together.

---

## Drizzle / SQL sketch

```sql
UPDATE jobs
SET status = $1, version = version + 1, updated_at = now()
WHERE id = $2 AND version = $3
RETURNING *;
```

Zero rows → map to 409 `CONFLICT_VERSION`. Never UPDATE without `WHERE version = expected`.

---

## Client

Send `expectedVersion` from the loaded document on every PATCH/submit. On 409, refetch or show merge UI — do not silently retry with stale body.

---

## Related

- `@eristack/backseat` — `jsonError`, `versionConflict`
- `@eristack/ai-knowledge#document-lines-erp` — aggregate shapes
- `@eristack/pbac` — business rules (separate from version conflict)
