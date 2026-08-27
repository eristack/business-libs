---
title: HTTP error envelope
description: Unified 409 JSON canon — CONFLICT_VERSION, POLICY_DENIED, STALE_EPOCH
sidebar_position: 7
---

# HTTP error envelope (409 and friends)

**Canonical guide** for JSON error bodies across Backseat mock handlers, Express/Nest adapters, and TanStack Query clients. Load: `@eristack/ai-knowledge#http-errors`.

Every `@eristack/*` adapter that returns structured errors uses the same top-level shape:

```json
{
  "error": {
    "code": "CONFLICT_VERSION",
    "message": "Job was modified by another user",
    "details": {}
  }
}
```

`details` is optional. Some adapters add domain fields at the top level of `error` (PBAC adds `policyId` and `reason` — see below).

---

## Status code map (production)

| HTTP | `error.code` | Meaning | Typical source |
| --- | --- | --- | --- |
| **400** | `VALIDATION_ERROR` | Malformed body, bad query, missing param | Backseat `validationError`, data-grid parse |
| **401** | `UNAUTHENTICATED` | Missing or invalid access token | jwt-auth express guard |
| **403** | `FORBIDDEN` / `FORBIDDEN_PERMISSION` / `FORBIDDEN_SCOPE` | RBAC/ABAC deny | rbac, abac express |
| **404** | `NOT_FOUND` | Resource missing | Any handler |
| **409** | `CONFLICT_VERSION` | Optimistic document version mismatch | App PATCH + Backseat `versionConflict` |
| **409** | `POLICY_DENIED` | ABAC attribute policy deny | abac express (`PolicyDeniedError`) |
| **409** | `BUSINESS_POLICY_DENIED` | Document software policy deny | pbac express (`createRequireBusinessPolicy`) |
| **409** | `STALE_EPOCH` | Client epoch ≠ server epoch on bump | `@eristack/epoch` `StaleEpochError` |
| **500** | `INTERNAL_ERROR` | Unhandled exception | Catch-all mappers |

**409 is overloaded on purpose.** Clients must branch on `error.code`, not status alone.

---

## Three 409 flavors agents confuse

### 1. `CONFLICT_VERSION` — optimistic document locking

Two editors saved the same aggregate. The write carried `expectedVersion` that no longer matches the row.

```json
{
  "error": {
    "code": "CONFLICT_VERSION",
    "message": "Document version conflict"
  }
}
```

- **Not** a permissions problem — refetch and merge or show conflict UI.
- **Not** epoch — epoch does not replace `version` on documents.
- See [optimistic-document-version](./optimistic-document-version.md).

### 2. `POLICY_DENIED` / `BUSINESS_POLICY_DENIED` — business rules

The user is authenticated and authorized by role, but the **document state** forbids the action.

ABAC (`@eristack/abac`):

```json
{
  "error": {
    "code": "POLICY_DENIED",
    "message": "Policy purchase-order.can-post denied"
  }
}
```

PBAC (`@eristack/pbac`):

```json
{
  "error": {
    "code": "BUSINESS_POLICY_DENIED",
    "message": "Transition not allowed",
    "policyId": "purchase-order.can-post",
    "reason": "PO must be in draft status"
  }
}
```

Show `reason` in the UI toast — do not retry blindly.

### 3. `STALE_EPOCH` — TanStack Query cache freshness

The client held a list/detail query while another tab or user bumped the data-version counter. `@eristack/epoch` returns:

```json
{
  "error": {
    "code": "STALE_EPOCH",
    "message": "Stale epoch for \"orders\": expected 4, current 5"
  }
}
```

Response may include header `X-Epoch-Current: 5`. Client should **refetch** (invalidate query), not show a merge dialog.

| Mechanism | Fixes |
| --- | --- |
| `expectedVersion` | Concurrent edits on one document |
| `epoch.bump` / `resolveCachePolicy` | Stale cached lists after any write |
| PBAC | Illegal status transition or business gate |

---

## Backseat helpers (Horizon A mock API)

Import from `@eristack/backseat` or `@eristack/backseat/adapters`:

```ts
import {
  jsonError,
  versionConflict,
  BackseatErrorCodes,
  BackseatVersionConflictError,
} from "@eristack/backseat";

// Generic envelope
return jsonError({
  status: 404,
  code: BackseatErrorCodes.NOT_FOUND,
  message: "Job not found",
});

// Optimistic version (409 CONFLICT_VERSION)
return versionConflict("Job was modified by another user");

// Throw — caught by api.handle()
throw new BackseatVersionConflictError("Job was modified");
```

Register helpers (`@eristack/backseat/adapters`):

```ts
import {
  policyDenied,
  validationError,
  normalizeBasePath,
  registerMountedRoutes,
} from "@eristack/backseat/adapters";

return policyDenied("Cannot post while locked");
return validationError("expectedVersion is required");
```

`BackseatErrorCodes` exports: `UNAUTHENTICATED`, `FORBIDDEN`, `FORBIDDEN_PERMISSION`, `FORBIDDEN_SCOPE`, `NOT_FOUND`, `CONFLICT_VERSION`, `POLICY_DENIED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

---

## Express unified error mapper (Horizon B)

One middleware-style mapper keeps Backseat graduation trivial — same JSON, swap IndexedDB for Drizzle:

```ts
import type { Request, Response, NextFunction } from "express";
import { StaleEpochError } from "@eristack/epoch";
import { PolicyDeniedError } from "@eristack/abac";
import { BusinessPolicyDeniedError } from "@eristack/pbac";
import {
  versionConflict,
  jsonError,
  BackseatErrorCodes,
} from "@eristack/backseat";

type ErrorBody = { error: { code: string; message: string; [k: string]: unknown } };

function sendEnvelope(res: Response, status: number, body: ErrorBody, headers?: Record<string, string>) {
  if (headers) {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  }
  return res.status(status).json(body);
}

/** Map domain errors thrown from handlers to the standard envelope. */
export function mapDomainError(res: Response, err: unknown): Response {
  if (err instanceof StaleEpochError) {
    return sendEnvelope(
      res,
      409,
      { error: { code: err.code, message: err.message } },
      { "X-Epoch-Current": String(err.current) },
    );
  }
  if (err instanceof PolicyDeniedError) {
    return sendEnvelope(res, 409, {
      error: { code: "POLICY_DENIED", message: err.message },
    });
  }
  if (err instanceof BusinessPolicyDeniedError) {
    return sendEnvelope(res, 409, {
      error: {
        code: "BUSINESS_POLICY_DENIED",
        message: err.message,
        policyId: err.policyId,
        reason: err.reason,
      },
    });
  }
  // Document version — app-owned check
  if (isVersionConflict(err)) {
    const body = versionConflict(err.message).body;
    return sendEnvelope(res, 409, body);
  }
  return sendEnvelope(res, 500, {
    error: { code: BackseatErrorCodes.INTERNAL_ERROR, message: "Unexpected error" },
  });
}

function isVersionConflict(err: unknown): err is { message: string } {
  return err instanceof Error && err.name === "DocumentVersionConflictError";
}

/** Wrap async route handlers */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => {
      if (res.headersSent) return next(err);
      mapDomainError(res, err);
    });
  };
}
```

### PATCH handler with version + PBAC + epoch bump

```ts
app.patch(
  "/jobs/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { expectedVersion, action, ...patch } = req.body;

    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, req.params.id) });
    if (!job) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    // 1) Optimistic version
    if (Number(job.version) !== Number(expectedVersion)) {
      return res.status(409).json(versionConflict("Job was modified").body);
    }

    // 2) Business policy (status transition)
    if (action) {
      await pbac.authorize("job.can-" + action, { document: job, action });
    }

    // 3) Write with version increment
    const [next] = await db
      .update(jobs)
      .set({ ...patch, version: job.version + 1, updatedAt: new Date() })
      .where(and(eq(jobs.id, job.id), eq(jobs.version, expectedVersion)))
      .returning();

    if (!next) {
      return res.status(409).json(versionConflict().body);
    }

    // 4) Cache freshness — after successful commit
    await epoch.bumpMany(["jobs", "dashboard"]);

    res.json(next);
  }),
);
```

Order matters: **version check → PBAC → SQL `WHERE version` → epoch bump**. Never bump epoch before the transaction commits.

---

## Client handling (TanStack Query)

```ts
async function patchJob(id: string, body: { expectedVersion: number; [k: string]: unknown }) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.ensureAccessToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.code;
    if (code === "CONFLICT_VERSION") {
      throw new VersionConflictError(data.error.message);
    }
    if (code === "BUSINESS_POLICY_DENIED" || code === "POLICY_DENIED") {
      throw new PolicyDeniedError(data.error.reason ?? data.error.message);
    }
    if (code === "STALE_EPOCH") {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      throw new StaleEpochError(data.error.message);
    }
    throw new ApiError(data.error?.message ?? "Request failed");
  }
  return data;
}
```

---

## Drizzle zero-row UPDATE → 409

Never `UPDATE` without `WHERE version = expected`. Zero rows affected means another writer won:

```ts
const updated = await db
  .update(jobs)
  .set({ status: "open", version: sql`${jobs.version} + 1` })
  .where(and(eq(jobs.id, id), eq(jobs.version, expectedVersion)))
  .returning();

if (updated.length === 0) {
  return versionConflict("Job was modified");
}
```

---

## `@eristack/epoch` REST mapping

`createRestEpochActions` already maps `StaleEpochError`:

```ts
import { toEpochErrorResponse } from "@eristack/epoch/rest";

try {
  await epoch.bump("orders", { expected: clientEpoch });
} catch (err) {
  const response = toEpochErrorResponse(err);
  // response.status === 409, body.error.code === "STALE_EPOCH"
  // response.headers["X-Epoch-Current"]
}
```

Use `resolveCachePolicy(scope, clientEpoch)` on read paths when you want **200** with `{ policy: "use-cache" | "refetch" }` instead of throwing.

---

## Anti-patterns

| Don't | Do |
| --- | --- |
| Return `{ message: "conflict" }` without `error.code` | Use `jsonError` / `versionConflict` |
| Use epoch as document version | Separate `version` column + `epoch.bump` after writes |
| Map all 409 to "try again" | Branch: merge UI vs toast vs refetch |
| Retry PATCH with same body after `CONFLICT_VERSION` | Refetch aggregate, re-apply edits |
| PBAC as a distributed lock | Transaction + `WHERE` guards for races |

---

## Related

- [optimistic-document-version](./optimistic-document-version.md) — `expectedVersion` pattern
- [document-lines-erp](./document-lines-erp.md) — PATCH sequences on job/cost sheet
- [backseat-then-backend](./backseat-then-backend.md) — Horizon A → B with same envelopes
- `@eristack/backseat` — `jsonError`, `versionConflict`, register helpers
- `@eristack/epoch` — `StaleEpochError`, `bumpMany`, cache policy
- `@eristack/pbac` — `BUSINESS_POLICY_DENIED` on Express
