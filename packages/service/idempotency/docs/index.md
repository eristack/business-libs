---
title: Overview
description: Idempotency-Key guard for HTTP and domain operations — claim a scoped key with a lease, run once, replay the stored result, reject reuse with a different body — with Drizzle store and Express/Nest/client adapters.
---

# @eristack/idempotency

Clients retry. Serverless functions time out and rerun. Users double-click "Create PO". `@eristack/idempotency` makes the second attempt **return the first result** instead of creating a second order.

The core is one guard: `run(key, fn)` / `runScoped({ scope, key, requestHash, fn })`. It atomically claims the key in a store with a **lease**, runs `fn`, records the result, and on subsequent calls returns the recorded result (or throws if the body differs). Adapters wrap that for Express, Nest, the browser, and Drizzle.

This page is the package API. The **architecture** — which layer dedupes what, how it pairs with domain `UNIQUE` constraints and `@eristack/outbox` — is one canonical guide: `@eristack/ai-knowledge#idempotency-and-outbox`. Read that once; read this for signatures.

## Use it when

- Any `POST` that creates something (orders, payments, shipments) and can be retried by a client or a proxy.
- Partner APIs (`platform-api-guard`: `rate-limit → api-key → idempotency → handler`).
- Serverless handlers where a timeout can leave the first attempt still running.

## Not for

- Preventing duplicate **rows** by business identity (same PO number twice) — a domain `UNIQUE(tenant_id, idempotency_key)` on the table; the guard is the HTTP layer, the constraint is the truth.
- Async side effects (send email once per invoice) — `@eristack/outbox` with derived keys.
- Ledger appends — `@eristack/hash-chained-ledger` has `idempotencyKey` on `append`.
- Cache invalidation — `@eristack/epoch`.

## Install

```bash
pnpm add @eristack/idempotency
pnpm add drizzle-orm        # ./drizzle
pnpm add express            # ./express
pnpm add @nestjs/common rxjs # ./nest
pnpm add zod                # ./zod
```

Peers (per subpath): `drizzle-orm ^0.39–0.44`, `express ^4||^5`, `@nestjs/common ^10||^11`, `rxjs ^7`, `zod ^4`.

## 30-second example

```ts
import { createIdempotencyGuard } from "@eristack/idempotency";
import { createDrizzleIdempotencyStore, createIdempotencyTables } from "@eristack/idempotency/drizzle";
import { wrapIdempotentHandler } from "@eristack/idempotency/express";

const tables = createIdempotencyTables("pgsql");                 // export from your schema for migrations
const guard = createIdempotencyGuard({ store: createDrizzleIdempotencyStore({ db, tables }), defaultLeaseMs: 60_000 });

app.post(
  "/api/purchase-orders",
  wrapIdempotentHandler(
    { guard, scopeFromReq: (req) => ({ tenantId: req.tenantId, scope: "POST /api/purchase-orders" }) },
    async (req) => {
      const po = await createPurchaseOrder(req.tenantId, req.body);   // + UNIQUE(tenant_id, idempotency_key)
      return { id: po.id, number: po.number };
    },
  ),
);
```

First `POST` with `Idempotency-Key: 7f3…` → 200 `{ id, number }`. Retry with the same key and body → 200 **same body**, handler not run. Same key, different body → 409 `IDEMPOTENCY_REQUEST_MISMATCH`. Same key while the first is still running past the lease → 409 `IDEMPOTENCY_CONFLICT` + `Retry-After: 1`.

## API

### Core (`@eristack/idempotency`)

| Export | Signature | Notes |
| --- | --- | --- |
| `createIdempotencyGuard` | `(store \| { store; defaultLeaseMs?; waitPollMs?; waitOnPending? }) => IdempotencyGuard` | Defaults: lease 60 000 ms, poll 50 ms, `waitOnPending: true`. |
| `guard.run` | `<T>(key, fn: () => Promise<T>) => Promise<T>` | Unscoped (`scope: "default"`, empty request hash). Fine for internal jobs; use `runScoped` for HTTP. |
| `guard.runScoped` | `<T>({ scope, key, requestHash, leaseMs?, fn }) => Promise<T>` | Storage key = `formatScopedIdempotencyKey(scope, key)` = `` `${tenantId ?? "_"}:${scope}:${key}` ``. |
| `hashIdempotencyRequest` | `(body: unknown) => Promise<string>` | Stable SHA-256 of the JSON body (used by adapters). |
| `formatScopedIdempotencyKey` | `(scope, key) => string` | Exported so you can query the table by the same key. |
| `IdempotencyStore` | `{ get; claim; complete; fail }` | Implement for another DB; `claim` must be atomic (`INSERT … ON CONFLICT`). |
| `IdempotencyRecord` | `{ state: "pending" \| "completed" \| "failed"; result?; errorMessage?; requestHash?; leaseExpiresAt?; createdAt }` | |
| `IdempotencyScope` | `{ tenantId?: string; scope: string }` | |
| `IdempotencyConflictError` | `code: "IDEMPOTENCY_CONFLICT"`, `.key` | Key pending and lease unexpired (only thrown when `waitOnPending: false` or the wait gives up). |
| `IdempotencyRequestMismatchError` | `code: "IDEMPOTENCY_REQUEST_MISMATCH"`, `.key` | Same key, different `requestHash`. |
| `createMemoryIdempotencyStore` | `() => IdempotencyStore` | **Unit tests only.** Also at `./testing`. |

### State machine (`runScoped`)

```
no record ──claim──▶ pending ──fn ok──▶ completed  (result replayed forever)
                       │  └──fn throws──▶ failed     (next call re-claims and retries fn)
                       └─ lease expires ──▶ reclaimable (serverless crash recovery)
another caller sees pending → waits up to the lease (poll waitPollMs) → returns completed result
                            → or throws IdempotencyConflictError if waitOnPending is false
```

### Adapters

| Subpath | Export | Notes |
| --- | --- | --- |
| `./drizzle` | `createIdempotencyTables(dialect, prefix = "idempotency")` | `pgsql \| mysql \| sqlite`; table `${prefix}_records` keyed by `storage_key`. |
| `./drizzle` | `createDrizzleIdempotencyStore({ db, tables })` | Production store. |
| `./express` | `wrapIdempotentHandler({ guard, header?, scopeFromReq? }, handler)` | Header default `Idempotency-Key`; **no header → handler runs unguarded**. Default scope `${method} ${baseUrl}${path}` (no tenant — pass `scopeFromReq`). Maps errors to 409 JSON `{ error, message, key }`. Handler return value is `res.json`'d with 200 unless it already sent. |
| `./nest` | `IdempotencyInterceptor`, `mapIdempotencyError(err)` | Interceptor with `{ guard, header?, scopeFromContext? }`; use `mapIdempotencyError` in an exception filter for the 409. |
| `./client` | `createIdempotencyClientFetch({ header?, createKey?, fetch? })` | `fetch` wrapper that adds one key per call (`crypto.randomUUID()`); pass `init.idempotencyKey` to reuse across retries. |
| `./zod` | `idempotencyScopeSchema`, `idempotencyKeySchema` | Key: 1–255 chars. |

## Works with

- `@eristack/api-key` / `@eristack/rate-limit` — guard chain order.
- `@eristack/outbox` — enqueue inside `fn`; the outbox key is derived (`po-${id}-confirmation`), not the HTTP key.
- `@eristack/logger` — log the scoped key on replay/mismatch.
- `examples/express` + `examples/react` — runnable Drizzle guard + client fetch.

## For agents

- Skills: `pnpm dlx @tanstack/intent@latest load @eristack/idempotency#idempotency-core` (guard) · `#idempotency-adapters` (Drizzle/Express/Nest/client). Architecture: `@eristack/ai-knowledge#idempotency-and-outbox`.
- Recipes: `idempotency-http-replay`, `platform-api-guard`.

## Next

- [Getting started](./getting-started.md) — migrations, Express + Nest wiring with tenant scope, the client side, leases on serverless, and cleanup.
