---
title: Recipes
description: Limits, scopes, combinators, and full RBAC + ABAC + PBAC gates
sidebar_position: 8
---

# Recipes

## Book-value limit (minor units)

```ts
import { createAbac, attrs } from "@eristack/abac";

const abac = createAbac();

abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  description: "Subject max book value must cover the GR",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
    reason: "Exceeds book-value limit",
  }),
});
```

Load `maxBookValueMinor` from your user_limits table in `getContext`. Compare with amounts built via [`@eristack/money`](/docs/money) in domain code; pass a minor-unit number into attrs.

## Warehouse scope

```ts
abac.registerPolicy({
  id: "warehouse.in-scope",
  evaluate: attrs.resourceInSubjectList({
    resourcePath: "resource.attrs.warehouseId",
    subjectListPath: "subject.attrs.warehouseIds",
  }),
});
```

## Department match

```ts
abac.registerPolicy({
  id: "orders.same-department",
  evaluate: (ctx) => {
    const a = attrs.get(ctx, "subject.attrs.department");
    const b = attrs.get(ctx, "resource.attrs.department");
    if (a == null || b == null) {
      return { allowed: false, policyId: "", reason: "Missing department" };
    }
    return a === b;
  },
});
```

## Cost-center equality via helper

```ts
abac.registerPolicy({
  id: "approvals.finance-only",
  evaluate: attrs.subjectAttrEquals("subject.attrs.department", "finance"),
});
```

## Multiple attribute gates (`evaluateAll`)

```ts
const decision = await abac.evaluateAll(
  ["goods-receipt.book-value-limit", "warehouse.in-scope"],
  ctx,
);
if (!decision.allowed) {
  // decision.policyId is the first failure
  console.warn(decision.policyId, decision.reason);
}
```

`evaluateAny` succeeds on the first allow — useful for “manager override **or** within limit” only when both policies are attribute-shaped (identity still belongs in RBAC).

## Stack with RBAC + PBAC

1. RBAC: may the user attempt `goods-receipt.post`?
2. ABAC: within their book-value / warehouse limits?
3. PBAC: does the PO still allow receiving?

```ts
await rbac.authorize(userId, "goods-receipt.post");
await abac.authorize("goods-receipt.book-value-limit", {
  subject: { id: userId, attrs: limits },
  resource: { attrs: { bookValueMinor } },
  action: "create",
});
await pbac.authorize("purchase-order.can-receive", {
  document: {
    status: po.status,
    outstandingMinor: po.outstandingMinor,
  },
});
```

See [Choosing access control](./choosing-access-control.md) and [`pbac` recipes](/docs/pbac/recipes).

## Express stack (copy-paste order)

```ts
import { createRequirePermission } from "@eristack/rbac/express";
import { createRequirePolicy } from "@eristack/abac/express";
import { createRequireBusinessPolicy } from "@eristack/pbac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePermission({ rbac, permission: "goods-receipt.post" }),
  createRequirePolicy({
    abac,
    policyId: "goods-receipt.book-value-limit",
    getContext: buildAbacContext,
  }),
  createRequireBusinessPolicy({
    pbac,
    policyId: "purchase-order.can-receive",
    getInput: async (req) => ({
      document: await loadPo(req.body.purchaseOrderId),
    }),
  }),
  createGoodsReceiptHandler,
);
```

## UI preview of deny reason

```ts
const { allowed, loading, reason } = usePolicy({
  abac,
  policyId: "goods-receipt.book-value-limit",
  context,
});

if (!loading && !allowed) {
  return <p>{reason ?? "Not allowed"}</p>;
}
```

## Boot registration module

```ts
import type { Abac } from "@eristack/abac";
import { attrs } from "@eristack/abac";

export function registerAbacPolicies(abac: Abac) {
  abac.registerPolicy({
    id: "goods-receipt.book-value-limit",
    evaluate: attrs.subjectLimitAtLeastResource({
      subjectPath: "subject.attrs.maxBookValueMinor",
      resourcePath: "resource.attrs.bookValueMinor",
    }),
  });
  abac.registerPolicy({
    id: "warehouse.in-scope",
    evaluate: attrs.resourceInSubjectList({
      resourcePath: "resource.attrs.warehouseId",
      subjectListPath: "subject.attrs.warehouseIds",
    }),
  });
}
```

Call once from app startup / Nest provider factory. Smoke-test:

```ts
expect(abac.listPolicies().map((p) => p.id).sort()).toEqual([
  "goods-receipt.book-value-limit",
  "warehouse.in-scope",
]);
```

## Owner-or-admin pattern (evaluateAny)

```ts
abac.registerPolicy({
  id: "doc.owner",
  evaluate: (ctx) =>
    attrs.get(ctx, "subject.id") === attrs.get(ctx, "resource.attrs.ownerId"),
});
abac.registerPolicy({
  id: "doc.admin-department",
  evaluate: attrs.subjectAttrEquals("subject.attrs.department", "admin"),
});

const decision = await abac.evaluateAny(["doc.owner", "doc.admin-department"], ctx);
```

Coarse “may edit documents at all” still belongs in RBAC (`documents.update`).

## Environment channel gate

```ts
abac.registerPolicy({
  id: "exports.api-only",
  evaluate: (ctx) => attrs.get(ctx, "environment.attrs.channel") === "api",
});
```

Set `channel` in server `getContext`, not from an untrusted query string alone.
