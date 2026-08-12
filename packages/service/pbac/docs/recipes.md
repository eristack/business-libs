---
title: Recipes
description: Stack RBAC + ABAC + PBAC and common document gates
sidebar_position: 6
---

# Recipes

## Full goods-receipt gate

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

| Step | Deny status |
| --- | --- |
| RBAC | 403 |
| ABAC | 403 |
| PBAC | 409 |

## Open + receivable (checkAll)

```ts
pbac.registerPolicy({
  id: "purchase-order.open",
  evaluate: documents.statusIn("status", ["open", "partial"]),
});
pbac.registerPolicy({
  id: "purchase-order.can-receive",
  evaluate: documents.positiveAmount("outstandingMinor"),
});

await pbac.checkAll(
  ["purchase-order.open", "purchase-order.can-receive"],
  { document: po },
);
```

## Invoice not locked

```ts
pbac.registerPolicy({
  id: "invoice.not-locked",
  evaluate: documents.flagNotSet("locked", "Invoice is locked"),
});
```

## Cancel only from draft/open

```ts
pbac.registerPolicy({
  id: "sales-order.can-cancel",
  evaluate: documents.statusIn("status", ["draft", "open"]),
});

await pbac.authorize("sales-order.can-cancel", { document: order });
await db.update(orders).set({ status: "cancelled" }).where(/* … */);
```

## Express stack (copy-paste order)

```ts
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

## React: disable Receive with reason

```ts
const { allowed, loading, decision } = useBusinessPolicy({
  pbac,
  policyId: "purchase-order.can-receive",
  input: { document: po },
});

<button disabled={loading || !allowed} title={decision?.reason}>
  Receive
</button>
```

## Boot registration

```ts
export function registerPbacPolicies(pbac: Pbac) {
  pbac.registerPolicy({
    id: "purchase-order.open",
    evaluate: documents.statusIn("status", ["open", "partial"]),
  });
  pbac.registerPolicy({
    id: "purchase-order.can-receive",
    evaluate: documents.positiveAmount("outstandingMinor"),
  });
  pbac.registerPolicy({
    id: "invoice.not-locked",
    evaluate: documents.flagNotSet("locked"),
  });
}
```
