---
title: Recipes
description: Stack RBAC + ABAC + PBAC
sidebar_position: 5
---

# Recipes

## Full goods-receipt gate

```ts
await rbac.authorize(userId, "goods-receipt.post");
await abac.authorize("goods-receipt.book-value-limit", {
  subject: { id: userId, attrs: limits },
  resource: { attrs: { bookValueMinor } },
});
await pbac.authorize("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});
```
