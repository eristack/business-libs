---
title: Getting started
description: Register and evaluate attribute policies
sidebar_position: 2
---

# Getting started

## Installation

```bash
pnpm add @eristack/abac
```

| Entry | Peer |
| --- | --- |
| `@eristack/abac` | — |
| `@eristack/abac/express` | `express` |
| `@eristack/abac/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/abac/react` | `react` |

## Create and register

```ts
import { createAbac, attrs } from "@eristack/abac";

const abac = createAbac();

abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  description: "Subject max book value must cover the GR",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
});
```

Policies are **code-registered**. Persist user attribute values in your app tables; pass them in `ctx.subject.attrs` at evaluation time.

## Evaluate

```ts
const decision = await abac.evaluate("goods-receipt.book-value-limit", {
  subject: {
    id: "user_1",
    attrs: { maxBookValueMinor: 5_000_000 },
  },
  resource: {
    type: "goods-receipt",
    attrs: { bookValueMinor: 1_200_000 },
  },
  action: "create",
});

decision.allowed; // true
decision.policyId; // "goods-receipt.book-value-limit"
```

## Authorize (throw on deny)

```ts
await abac.authorize("goods-receipt.book-value-limit", ctx);
// throws PolicyDeniedError when not allowed
```

## Custom policy function

```ts
abac.registerPolicy({
  id: "orders.same-department",
  evaluate: (ctx) => {
    const subjectDept = attrs.get(ctx, "subject.attrs.department");
    const orderDept = attrs.get(ctx, "resource.attrs.department");
    if (subjectDept == null || orderDept == null) {
      return { allowed: false, policyId: "", reason: "Missing department" };
    }
    return subjectDept === orderDept;
  },
});
```

Async evaluators are allowed (e.g. load extra attrs):

```ts
abac.registerPolicy({
  id: "warehouse.in-scope-live",
  evaluate: async (ctx) => {
    const live = await loadWarehouses(ctx.subject.id);
    return live.includes(String(attrs.get(ctx, "resource.attrs.warehouseId")));
  },
});
```

Prefer loading attrs in `getContext` (middleware) so policies stay pure and testable.

## List / unregister

```ts
abac.listPolicies();
abac.unregisterPolicy("orders.same-department");
```

## Next steps

- [Attributes](./attributes.md) — path helpers and stacking
- [Adapters](./adapters.md) — Express / Nest / React
- [Recipes](./recipes.md) — common policies
