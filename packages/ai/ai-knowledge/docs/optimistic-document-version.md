---
title: Optimistic document version
description: expectedVersion + 409 CONFLICT_VERSION — distinct from epoch cache
sidebar_position: 6
---

# Optimistic document version (expectedVersion)

**Canonical pattern** for ERP document aggregates (job, cost sheet, invoice). **Not** a package — app-owned `version` column + handler check. Distinct from `@eristack/epoch` (cache invalidation only).

Load: `@eristack/ai-knowledge#optimistic-document-version`. For 409 envelope details see [http-errors](./http-errors.md).

---

## Rule

Every mutable aggregate carries integer `version` (starts at `1`). Commands include `expectedVersion`. Save succeeds only when stored version matches; else **409 `CONFLICT_VERSION`**.

| Mechanism | Purpose |
| --- | --- |
| `version` + `expectedVersion` | Write conflict (two editors) |
| `@eristack/epoch` | TanStack Query cache freshness |

Do not use epoch as a substitute for optimistic locking.

---

## Schema (app-owned)

Add to every mutable header and 1:1 child you PATCH independently:

```sql
-- jobs, cost_sheets, invoices, …
version INTEGER NOT NULL DEFAULT 1,
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Drizzle:

```ts
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // … branchId, trade, etd wall, customerId
});
```

Return `version` on every GET so the client can send it back on PATCH.

---

## HTTP envelope

Same shape in Backseat and Express:

```json
{ "error": { "code": "CONFLICT_VERSION", "message": "Job was modified by another user" } }
```

Backseat helpers:

```ts
import { jsonError, versionConflict, BackseatVersionConflictError } from "@eristack/backseat";

return versionConflict("Job was modified");
throw new BackseatVersionConflictError("Job was modified");
```

Full status map: [http-errors](./http-errors.md).

---

## PATCH sequence (production)

Typical job PATCH with status action, line recalc elsewhere, epoch bump after commit:

```text
1. Client: PATCH /jobs/:id  { expectedVersion, action?, …fields }
2. Server: load row; 404 if missing
3. Server: if row.version !== expectedVersion → 409 CONFLICT_VERSION
4. Server: pbac.authorize("job.can-{action}", { document, action }) if action present
5. Server: UPDATE … WHERE id AND version = expectedVersion RETURNING *
6. Server: if zero rows → 409 CONFLICT_VERSION (race lost)
7. Server: epoch.bumpMany(["jobs", "dashboard"])  // after commit
8. Client: on 409 CONFLICT_VERSION → refetch job, show merge UI
9. Client: on 409 BUSINESS_POLICY_DENIED → toast reason, keep form
10. Client: on list stale → resolveCachePolicy or refetch on STALE_EPOCH
```

**Never** bump epoch inside the transaction before you know the write succeeded.

---

## Backseat handler (Horizon A)

```ts
import { jsonError, versionConflict } from "@eristack/backseat";

async function patchJob(ctx) {
  const { expectedVersion, action, ...patch } = await ctx.json();

  if (expectedVersion == null) {
    return jsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "expectedVersion is required",
    });
  }

  const current = await ctx.store.get("jobs", ctx.params.id);
  if (!current) {
    return jsonError({ status: 404, code: "NOT_FOUND", message: "Job not found" });
  }
  if (Number(current.version) !== Number(expectedVersion)) {
    return versionConflict("Job was modified by another user");
  }

  if (action) {
    const gate = await pbac.check("job.can-" + action, { document: current, action });
    if (!gate.allowed) {
      return jsonError({
        status: 409,
        code: "BUSINESS_POLICY_DENIED",
        message: gate.reason ?? "Transition not allowed",
        details: { policyId: gate.policyId },
      });
    }
  }

  const next = {
    ...current,
    ...patch,
    version: Number(current.version) + 1,
    updatedAt: new Date().toISOString(),
  };

  await ctx.store.update("jobs", String(current.id), next);
  await epoch.bumpMany(["jobs", "dashboard"]);

  return ctx.json(200, next);
}
```

Multi-collection writes (job + cost sheet header) use `store.atomic()` and bump **both** versions in one handler:

```ts
await api.store.atomic(async (tx) => {
  const job = await tx.get("jobs", id);
  const sheet = await tx.get("costSheets", sheetId);
  if (Number(job.version) !== expectedJobVersion) throw new BackseatVersionConflictError();
  await tx.set("jobs", { ...job, version: job.version + 1, ...patch });
  await tx.set("costSheets", { ...sheet, version: sheet.version + 1 });
});
await epoch.bumpMany(["jobs", "cost-sheets"]);
```

---

## Express + Drizzle (Horizon B)

```ts
app.patch(
  "/jobs/:id",
  requireAuth,
  async (req, res) => {
    const { expectedVersion, action, ...patch } = req.body;

    const [updated] = await db
      .update(jobs)
      .set({
        ...patch,
        version: sql`${jobs.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(jobs.id, req.params.id), eq(jobs.version, expectedVersion)))
      .returning();

    if (!updated) {
      const exists = await db.query.jobs.findFirst({
        where: eq(jobs.id, req.params.id),
        columns: { version: true },
      });
      if (!exists) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Job not found" },
        });
      }
      return res.status(409).json(versionConflict().body);
    }

    await epoch.bumpMany(["jobs", "dashboard"]);
    res.json(updated);
  },
);
```

Run PBAC **before** the UPDATE when you need the pre-image status; re-check outstanding fields inside the transaction for races.

---

## 409 examples (client)

| Response | User action |
| --- | --- |
| `CONFLICT_VERSION` | "Someone else saved this job" → refetch, diff, re-submit with new version |
| `BUSINESS_POLICY_DENIED` + `reason` | "Cannot post: cost sheet must be approved" → no retry |
| `STALE_EPOCH` | Silent refetch of job list (another user created a job) |

```ts
if (err.code === "CONFLICT_VERSION") {
  const fresh = await fetchJob(id);
  openMergeDialog({ local: formState, remote: fresh });
}
```

Do not silently retry PATCH with the same `expectedVersion`.

---

## Seed pack note (Horizon A demos)

When seeding Backseat IndexedDB for demos, initialize **`version: 1`** on every mutable aggregate so first PATCH sends `expectedVersion: 1`:

```ts
await api.store.set("jobs", {
  id: "job-seed-1",
  version: 1,
  status: "draft",
  branchId: "CGK",
  trade: "export",
});
```

Document the seed version in your demo README so agents do not forget `expectedVersion` in handlers. A future `examples/horizon-a/seed-v1.json` should list `version` on jobs, cost sheets, and invoices.

---

## Client contract

Send `expectedVersion` from the loaded document on every PATCH/submit. Include it in TanStack Form default values:

```ts
form.setFieldValue("expectedVersion", job.version);
```

On successful save, replace local state with response body (new `version`).

---

## Related

- [http-errors](./http-errors.md) — unified 409 JSON canon
- `@eristack/backseat` — `jsonError`, `versionConflict`
- `@eristack/ai-knowledge#document-lines-erp` — aggregate shapes
- `@eristack/pbac` — business rules (separate from version conflict)
- `@eristack/epoch` — list cache after writes
