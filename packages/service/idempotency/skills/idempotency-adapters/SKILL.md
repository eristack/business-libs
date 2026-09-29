---
name: idempotency-adapters
description: >
  @eristack/idempotency adapters: drizzle createIdempotencyTables + createDrizzleIdempotencyStore
  (production store), express wrapIdempotentHandler({ guard, scopeFromReq }, handler) → replay 200
  / 409 JSON, nest IdempotencyInterceptor + mapIdempotencyError, client
  createIdempotencyClientFetch (one key per submit intent), zod schemas. Use when wiring the
  guard into HTTP and the browser; no header means the handler runs unguarded.
metadata:
  author: eristack
  version: "0.1"
  type: adapter
  library: "@eristack/idempotency"
sources:
  - packages/service/idempotency/docs/getting-started.md
---

# @eristack/idempotency adapters

```ts
// Express
import { wrapIdempotentHandler } from "@eristack/idempotency/express";
app.post("/api/purchase-orders",
  wrapIdempotentHandler(
    { guard, scopeFromReq: (req) => ({ tenantId: req.tenantId, scope: "POST /api/purchase-orders" }) },
    async (req) => ({ id: (await createPo(req)).id }),   // res.json(…) 200; replayed on retry
  ));
// 409 { error: "IDEMPOTENCY_REQUEST_MISMATCH" | "IDEMPOTENCY_CONFLICT", message, key }; Retry-After: 1 on conflict

// Nest
@UseInterceptors(new IdempotencyInterceptor({ guard, scopeFromContext: (ctx) => ({ tenantId, scope }) }))
// + exception filter: const m = mapIdempotencyError(err); if (m) res.status(m.status).json(m.body)

// Client
const idempotentFetch = createIdempotencyClientFetch();
idempotentFetch(url, { method: "POST", body, idempotencyKey });   // hold ONE key per submit intent; omit → new UUID per call
```

## Checklist

1. `./drizzle`: `createIdempotencyTables(dialect, prefix?)` in `schema.ts`; `createDrizzleIdempotencyStore({ db, tables })`.
2. Express/Nest: pass a scope with `tenantId`; require the header on partner routes (400 if missing) — absent header = unguarded.
3. Client: key lives in form state for one submit; reset after success. `examples/react` shows it.
4. Guard chain: `@eristack/rate-limit` → `@eristack/api-key` → idempotency → handler.
5. Validate wire input with `idempotencyKeySchema` (1–255 chars) from `./zod`.

## Do not

- Send the response before returning from the handler unless you also want the guard to store `undefined`.
- Let the default scope (`${method} ${baseUrl}${path}`) stand in a multi-tenant app.
- Use the memory store (`./testing`) outside tests.
