---
title: Adapters
description: Express, Nest, React — context factories, 403 mapping, guard order
sidebar_position: 7
---

# Adapters

Headless shells: build an `AbacContext`, call `authorize` / `evaluate`, map deny to HTTP. No attribute database, no UI kit.

```text
@eristack/abac                 core — createAbac / registerPolicy / evaluate
        ├── /express           createRequirePolicy → 403 POLICY_DENIED
        ├── /nest              AbacModule + AbacGuard + @RequirePolicy
        └── /react             usePolicy → { allowed, loading, reason }
```

## Middleware / guard order

```text
requireAuth (401)
  → createRequirePermission / RbacGuard (403)
  → createRequirePolicy / AbacGuard (403)
  → createRequireBusinessPolicy / PbacGuard (409)
  → handler
```

ABAC must run **after** identity is known (`subject` on the request) and usually after RBAC so you do not load attribute tables for users who lack the coarse permission.

## Express

### `createRequirePolicy`

```ts
import { createRequirePolicy } from "@eristack/abac/express";
import type { AbacRequest } from "@eristack/abac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePermission({ rbac, permission: "goods-receipt.post" }),
  createRequirePolicy({
    abac,
    policyId: "goods-receipt.book-value-limit",
    getContext: async (req: AbacRequest) => ({
      subject: {
        id: req.auth!.subject!,
        attrs: await loadUserLimits(req.auth!.subject!),
      },
      resource: {
        type: "goods-receipt",
        attrs: { bookValueMinor: req.body.bookValueMinor },
      },
      action: "create",
    }),
  }),
  handler,
);
```

| Option | Role |
| --- | --- |
| `abac` | Engine from `createAbac()` |
| `policyId` | Must be registered |
| `getContext` | Sync or async `(req) => AbacContext` |

`AbacRequest` is `Request` plus optional `subject` / `auth.subject` — fill those from jwt-auth (or your own middleware) before this runs.

### 403 body

On `PolicyDeniedError` only:

```json
{
  "error": {
    "code": "POLICY_DENIED",
    "message": "Policy \"goods-receipt.book-value-limit\" denied: Value 9000000 exceeds subject limit 5000000",
    "policyId": "goods-receipt.book-value-limit",
    "reason": "Value 9000000 exceeds subject limit 5000000"
  }
}
```

Other errors (missing policy, loader throw) call `next(err)` — wire your Express error middleware.

### Multiple policies on one route

`createRequirePolicy` takes a **single** `policyId`. For several attribute gates either:

1. Mount two middlewares, or
2. Authorize in the handler with `evaluateAll`, or
3. Register one composite policy that calls helpers internally.

```ts
// Option 1 — two middleware
createRequirePolicy({ abac, policyId: "goods-receipt.book-value-limit", getContext }),
createRequirePolicy({ abac, policyId: "warehouse.in-scope", getContext }),
```

Same `getContext` can be shared; each call rebuilds the bag (cache in `req` if expensive).

### Sharing context on `req`

```ts
const attachAbacContext = async (req: AbacRequest, _res, next) => {
  req.abacContext = {
    subject: {
      id: req.auth!.subject!,
      attrs: await loadUserLimits(req.auth!.subject!),
    },
    resource: { attrs: { bookValueMinor: req.body.bookValueMinor } },
    action: "create",
  };
  next();
};

createRequirePolicy({
  abac,
  policyId: "goods-receipt.book-value-limit",
  getContext: (req) => req.abacContext!,
});
```

(`abacContext` is your augmentation — not provided by the package.)

## NestJS

### Module

```ts
import { AbacModule, AbacGuard, RequirePolicy, AbacContextFactory, ABAC } from "@eristack/abac/nest";

const abac = createAbac();
registerAbacPolicies(abac);

@Module({
  imports: [AbacModule.forRoot({ abac })],
})
export class AppModule {}
```

`forRoot` registers `ABAC` + `AbacGuard` as **global** providers.

### Handler metadata

```ts
@Post()
@RequirePolicy("goods-receipt.book-value-limit")
@AbacContextFactory(async (req: { user: { subject: string }; body: { bookValueMinor: number } }) => ({
  subject: {
    id: req.user.subject,
    attrs: await loadUserLimits(req.user.subject),
  },
  resource: { attrs: { bookValueMinor: req.body.bookValueMinor } },
  action: "create",
}))
@UseGuards(/* AuthGuard, RbacGuard, */ AbacGuard)
create() {
  /* … */
}
```

| Export | Role |
| --- | --- |
| `RequirePolicy(policyId)` | Sets metadata `eristack:abac:policy` |
| `AbacContextFactory(fn)` | Sets metadata `eristack:abac:context` |
| `AbacGuard` | Reads both; `evaluate`; deny → `ForbiddenException` |
| `ABAC` | Injection token for the engine |

Behavior notes:

- No `@RequirePolicy` → guard returns `true` (no-op).
- `@RequirePolicy` without `@AbacContextFactory` → `ForbiddenException` explaining the factory is required.
- Deny uses Nest `ForbiddenException` with `decision.reason` (or a default message) — not the Express JSON envelope. Shape your exception filter if clients need `policyId` in the body.

### Guard order with RBAC / PBAC

```ts
@UseGuards(JwtAuthGuard, RbacGuard, AbacGuard, PbacGuard)
```

Or compose a single app guard that runs the same sequence. Metadata decorators from each package are independent.

## React

```ts
import { usePolicy } from "@eristack/abac/react";

const { allowed, loading, reason } = usePolicy({
  abac,
  policyId: "goods-receipt.book-value-limit",
  context: {
    subject: { id: userId, attrs: limits },
    resource: { attrs: { bookValueMinor: draftMinor } },
    action: "create",
  },
});

<button disabled={loading || !allowed} title={reason}>
  Post receipt
</button>
```

| Field | Meaning |
| --- | --- |
| `allowed` | Last evaluate result (false while loading / missing context) |
| `loading` | Evaluate in flight |
| `reason` | Deny reason string when present |

**Server still enforces.** Recompute `context` when draft amounts change so the button tracks the limit. See [Edge cases](./edge-cases.md#react-hook-returns-reason-not-decision).

## Injection checklist

| Layer | You inject |
| --- | --- |
| Core | nothing — `createAbac()` then `registerPolicy` |
| Express | `abac`, `policyId`, `getContext` |
| Nest | `abac` via `AbacModule.forRoot`, policy + factory metadata |
| React | `abac`, `policyId`, `context` |

## Testing adapters

```ts
const abac = createAbac();
abac.registerPolicy({
  id: "warehouse.in-scope",
  evaluate: attrs.resourceInSubjectList({
    resourcePath: "resource.attrs.warehouseId",
    subjectListPath: "subject.attrs.warehouseIds",
  }),
});

await expect(
  abac.authorize("warehouse.in-scope", {
    subject: { id: "u1", attrs: { warehouseIds: ["W1"] } },
    resource: { attrs: { warehouseId: "W2" } },
  }),
).rejects.toBeInstanceOf(PolicyDeniedError);
```

Hit Express with supertest against a mini app if you need the 403 JSON shape.

## Next steps

- [Edge cases](./edge-cases.md)
- [Recipes](./recipes.md)
- [Choosing access control](./choosing-access-control.md)
