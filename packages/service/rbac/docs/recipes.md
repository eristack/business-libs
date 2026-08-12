---
title: Recipes
description: Common RBAC setups
sidebar_position: 5
---

# Recipes

## Seed roles at boot

```ts
const permissions = [
  "orders.read",
  "orders.create",
  "orders.approve",
  "goods-receipt.post",
] as const;

for (const name of permissions) {
  await rbac.definePermission({ name });
}

await rbac.defineRole({
  name: "purchasing.clerk",
  permissions: ["orders.read", "orders.create", "goods-receipt.post"],
});
await rbac.defineRole({
  name: "purchasing.manager",
  permissions: [...permissions],
});
```

## Layer with ABAC / PBAC

```ts
await rbac.authorize(userId, "goods-receipt.post");
await abac.authorize("goods-receipt.book-value-limit", ctx);
await pbac.authorize("purchase-order.can-receive", { document: po });
```

RBAC = who may attempt the action. ABAC = attribute limits. PBAC = document rules.
