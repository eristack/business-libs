---
title: Getting started
description: Production wiring — Drizzle tables and migrations, tenant-scoped Express and Nest guards, the browser fetch helper, lease tuning for serverless, domain UNIQUE pairing, and record cleanup.
---

# Getting started

Architecture and layer responsibilities live in `@eristack/ai-knowledge#idempotency-and-outbox`. This page is the wiring.

## Install

```bash
pnpm add @eristack/idempotency drizzle-orm express
```

## 1. Tables and migration

```ts
// schema.ts — export so drizzle-kit generates the migration
import { createIdempotencyTables } from "@eristack/idempotency/drizzle";

export const idempotency = createIdempotencyTables("pgsql");   // { records }
```

```bash
pnpm drizzle-kit generate && pnpm drizzle-kit migrate
```

Columns: `storage_key` (PK), `state`, `request_hash`, `response_json`, `error_message`, `lease_expires_at`, `created_at`, `updated_at`.

## 2. One guard for the app

```ts
// idempotency.ts
import { createIdempotencyGuard } from "@eristack/idempotency";
import { createDrizzleIdempotencyStore } from "@eristack/idempotency/drizzle";
import { idempotency } from "./schema.js";

export const guard = createIdempotencyGuard({
  store: createDrizzleIdempotencyStore({ db, tables: idempotency }),
  defaultLeaseMs: 60_000,   // ≥ your slowest handler + function timeout
  waitPollMs: 50,
  waitOnPending: true,      // second caller waits for the first instead of 409
});
```

## 3. Express — always scope by tenant

```ts
import { wrapIdempotentHandler } from "@eristack/idempotency/express";

const scoped = (scope: string) => ({
  guard,
  scopeFromReq: (req: Request) => ({ tenantId: req.tenantId, scope }),   // tenants never collide on keys
});

app.post("/api/purchase-orders", requireAuth, wrapIdempotentHandler(scoped("POST /api/purchase-orders"), async (req) => {
  const key = req.header("Idempotency-Key")!;
  const po = await db.transaction(async (tx) => {
    const [row] = await tx.insert(purchaseOrders).values({
      id: generateEntityId(),
      tenantId: req.tenantId,
      idempotencyKey: key,                // UNIQUE(tenant_id, idempotency_key) — domain truth
      ...req.body,
    }).returning();
    await outbox.enqueue({ /* confirmation email, derived key */ });
    return row;
  });
  return { id: po.id, number: po.number };
}));
```

Why both the guard **and** the `UNIQUE`? The guard gives clients a replayed 200 and stops the handler running twice in the normal case. The constraint guarantees correctness if the guard's store is ever bypassed (a migration script, a second service). Belt and braces; the guide explains the layering.

## 4. Nest

```ts
import { IdempotencyInterceptor, mapIdempotencyError } from "@eristack/idempotency/nest";

@Controller("purchase-orders")
@UseInterceptors(new IdempotencyInterceptor({
  guard,
  scopeFromContext: (ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return { tenantId: req.tenantId, scope: `${req.method} ${req.route.path}` };
  },
}))
export class PurchaseOrdersController { /* @Post() create() … */ }

@Catch()
export class IdempotencyFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const mapped = mapIdempotencyError(err);
    if (!mapped) throw err;
    host.switchToHttp().getResponse().status(mapped.status).json(mapped.body);
  }
}
```

## 5. Client — one key per submit intent

```ts
import { createIdempotencyClientFetch } from "@eristack/idempotency/client";

const idempotentFetch = createIdempotencyClientFetch();

// In the form submit: generate once, reuse on every retry of THIS submit
const idempotencyKey = crypto.randomUUID();
async function submit(body: unknown) {
  return idempotentFetch("/api/purchase-orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    idempotencyKey,                       // same key if the user clicks again or the network retries
  });
}
```

Omitting `idempotencyKey` makes the helper mint a fresh UUID **per call** — which defeats retries. Hold the key in component state for the lifetime of one "submit intent" and reset it after success. `examples/react` shows this.

## 6. Leases on serverless

A function killed mid-handler leaves the record `pending`. The lease is how the next attempt reclaims it:

| Setting | Guidance |
| --- | --- |
| `defaultLeaseMs` | Longer than the platform timeout (Vercel default 10–60 s) plus DB latency. 60 s is a sane floor; 5 min for batch imports. |
| `waitOnPending: true` | Second concurrent caller polls until the first completes or the lease expires — good for double-clicks. |
| `waitOnPending: false` | Return 409 immediately — better for partner APIs that implement their own backoff. |
| Per-route `leaseMs` | `runScoped({ …, leaseMs })` when one route is much slower than the rest. |

## 7. Cleanup

Records accumulate forever. Run a nightly job:

```sql
DELETE FROM idempotency_records WHERE created_at < now() - interval '7 days';
```

Seven days covers every reasonable client retry window; match it to what you promise partners.

## Gotchas

- **No header, no guard.** `wrapIdempotentHandler` runs the handler unguarded when `Idempotency-Key` is absent. Require it explicitly on partner routes (`if (!req.header("Idempotency-Key")) return 400`).
- **Default scope has no tenant.** `${method} ${baseUrl}${path}` means tenant A's key `abc` collides with tenant B's. Always pass `scopeFromReq`/`scopeFromContext` with `tenantId`.
- Replays return the **stored result**, not a fresh read. If the handler returned `{ id }`, that is all the retry gets — return what the client needs.
- Handler responses over ~1 MB bloat `response_json`; return identifiers, not documents.
- A handler that **throws** marks the record `failed`; the next call with the same key **re-runs** it. That is intended (transient failure) — make sure the failed attempt did not partially commit (use one transaction).
- Body hash is over `req.body` after your JSON middleware — key order does not matter (stable stringify), but `"1"` vs `1` does.
- Memory store (`./testing`) is per-process and unbounded; never in production.

## Testing

```ts
import { createIdempotencyGuard, createMemoryIdempotencyStore, IdempotencyRequestMismatchError } from "@eristack/idempotency";
import { expect, it, vi } from "vitest";

it("runs once and replays", async () => {
  const guard = createIdempotencyGuard(createMemoryIdempotencyStore());
  const fn = vi.fn(async () => ({ id: "po-1" }));
  const scope = { tenantId: "t1", scope: "POST /po" };
  const a = await guard.runScoped({ scope, key: "k", requestHash: "h1", fn });
  const b = await guard.runScoped({ scope, key: "k", requestHash: "h1", fn });
  expect(a).toEqual(b);
  expect(fn).toHaveBeenCalledTimes(1);
  await expect(guard.runScoped({ scope, key: "k", requestHash: "h2", fn })).rejects.toBeInstanceOf(IdempotencyRequestMismatchError);
});
```

For the Drizzle store, `@internal/test-harness` (repo) or an in-memory SQLite `db` with `createIdempotencyTables("sqlite")` exercises the real `claim` race path.
