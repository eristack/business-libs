---
name: idempotency-core
description: >
  @eristack/idempotency createIdempotencyGuard({ store, defaultLeaseMs, waitOnPending }) →
  run(key, fn) / runScoped({ scope: { tenantId, scope }, key, requestHash, fn }): atomic claim
  with lease, run once, replay stored result, 409 IDEMPOTENCY_REQUEST_MISMATCH on different body,
  IDEMPOTENCY_CONFLICT while pending. Pair with domain UNIQUE(tenant_id, idempotency_key).
  Drizzle store is production; memory store tests only. Architecture: #idempotency-and-outbox.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/idempotency"
sources:
  - packages/service/idempotency/docs/getting-started.md
---

# @eristack/idempotency (core)

One guard per app. HTTP adapters (`./express`, `./nest`, `./client`) are thin wrappers over `runScoped` — see `#idempotency-adapters`.

```ts
import { createIdempotencyGuard, hashIdempotencyRequest } from "@eristack/idempotency";
import { createDrizzleIdempotencyStore, createIdempotencyTables } from "@eristack/idempotency/drizzle";

export const guard = createIdempotencyGuard({
  store: createDrizzleIdempotencyStore({ db, tables: createIdempotencyTables("pgsql") }),
  defaultLeaseMs: 60_000, waitPollMs: 50, waitOnPending: true,
});

const result = await guard.runScoped({
  scope: { tenantId, scope: "POST /api/purchase-orders" },   // storage key `${tenant}:${scope}:${key}`
  key: req.header("Idempotency-Key")!,
  requestHash: await hashIdempotencyRequest(req.body),
  fn: () => createPurchaseOrder(body),                        // return what the client needs; it is replayed verbatim
});
```

States: `pending` (lease) → `completed` (replay forever) | `failed` (next call re-runs `fn`) | lease expired → reclaimable.

## Checklist

1. `createIdempotencyTables("pgsql")` exported from `schema.ts` → drizzle-kit migration.
2. Scope **always includes `tenantId`**; default Express scope does not.
3. Inside `fn`: one transaction; insert with `idempotencyKey` column + `UNIQUE(tenant_id, idempotency_key)`; `@eristack/outbox` enqueue in the same TX.
4. `defaultLeaseMs` > platform timeout (60 s floor; minutes for imports).
5. Nightly delete of records older than the promised retry window (7 days).

## Do not

- Use `run(key, fn)` for HTTP — no tenant, no body hash.
- Return large documents from `fn` (stored as JSON, replayed).
- Use `createMemoryIdempotencyStore` outside unit tests.
- Treat the guard as the only dedup — the domain UNIQUE is the truth.
