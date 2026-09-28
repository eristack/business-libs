# Idempotency and outbox

One guide for duplicate POSTs, serverless races, ledger retries, and async side effects.

## Four layers (office pattern)

1. **Client** — one `Idempotency-Key` per submit intent (`@eristack/idempotency/client`).
2. **HTTP replay** — `@eristack/idempotency` scoped store + optional Express `wrapIdempotentHandler`.
3. **Domain** — app `UNIQUE (tenant_id, idempotency_key)` on create (PO, …).
4. **Async** — `@eristack/outbox` in the same TX; workers call comms/payment with derived keys.

## Platform guard order

`rate-limit` → `api-key` → `idempotency` → handler. See `@eristack/ai-knowledge#party-and-platform-compose`.

## HTTP idempotency (production)

```ts
import { createDrizzleIdempotencyStore, createIdempotencyTables } from "@eristack/idempotency/drizzle";
import { createIdempotencyGuard, hashIdempotencyRequest } from "@eristack/idempotency";
import { wrapIdempotentHandler } from "@eristack/idempotency/express";

const store = createDrizzleIdempotencyStore({ db, tables: createIdempotencyTables("pgsql") });
const guard = createIdempotencyGuard({ store, defaultLeaseMs: 60_000 });

app.post(
  "/api/purchase-orders",
  wrapIdempotentHandler({ guard }, async (req) => {
    // insert PO + UNIQUE(tenant_id, idempotency_key)
    return { id: po.id };
  }),
);
```

- Scoped key: `tenantId + route scope + Idempotency-Key`.
- `requestHash` mismatch → 409 (same key, different body).
- Pending **lease** expires so serverless retries can reclaim.

Memory store: **tests only**.

## Ledger append dedup

Implemented in `@eristack/hash-chained-ledger` — optional `idempotencyKey` on `append`.

| Package | Pass keys |
| --- | --- |
| `@eristack/stock-movement` | `idempotencyKey` on `append` |
| `@eristack/financial-ledger` | `idempotencyKey` on `post` |
| `@eristack/valuations` | `operationId` → `${op}:qty` / `${op}:value` |

Drizzle: `UNIQUE(chain_id, idempotency_key)`.

## Side-effect hubs

**Comms / payment-manager:** durable row (`queued` / `pending`) **before** vendor/gateway; handle UNIQUE races; webhook events deduped by provider/gateway event id.

**Outbox:** enqueue with `idempotencyKey`; worker handlers:

```ts
await comms.send({ ..., idempotencyKey: `outbox:${message.id}` });
```

## Explicit non-goals

- `@eristack/epoch` bump — not Idempotency-Key.
- `@eristack/pbac` — policy only; use TX + qty checks.
- `@eristack/jwt-auth` refresh rotation — separate from HTTP keys.

## Recipes

- `platform-api-guard` — middleware order
- `idempotency-http-replay` — HTTP store + adapters
- `ledger-idempotent-append` — HCL + stock/financial/valuations
- `reliable-side-effects-outbox` — outbox + comms/payment
