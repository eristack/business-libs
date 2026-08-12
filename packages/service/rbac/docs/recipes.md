---
title: Recipes
description: Seed roles, admin UI, and stack with ABAC / PBAC
sidebar_position: 6
---

# Recipes

## Seed roles at boot

Idempotent upserts — safe on every process start.

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

## Assign on signup / invite

```ts
await db.insert(users).values({ id, displayName, createdAt: new Date() });
await rbac.assignRole({ subject: id, role: "purchasing.clerk" });
// then jwt-auth registerCredentials / issueTokens
```

## Admin: list effective permissions

```ts
const roles = await rbac.rolesFor(subject);
const permissions = [...(await rbac.permissionsFor(subject))].sort();
```

Build your own admin UI — the package does not ship one. Persist role edits with `assignRole` / `revokeRole` / `defineRole`.

## Break-glass direct grant

```ts
await rbac.grantPermission({
  subject: userId,
  permission: "orders.approve",
});
// later
await rbac.revokePermission({
  subject: userId,
  permission: "orders.approve",
});
```

Prefer a short-lived role over permanent direct grants when you can.

## Express route with jwt-auth

```ts
app.post(
  "/orders",
  requireAuth, // sets req.auth.subject
  createRequirePermission({ rbac, permission: "orders.create" }),
  async (req, res) => {
    /* create order */
  },
);
```

## Layer with ABAC / PBAC (goods receipt)

```ts
await rbac.authorize(userId, "goods-receipt.post");
await abac.authorize("goods-receipt.book-value-limit", {
  subject: { id: userId, attrs: limits },
  resource: { attrs: { bookValueMinor } },
  action: "create",
});
await pbac.authorize("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});
```

| Layer | Question | HTTP on deny |
| --- | --- | --- |
| RBAC | May they attempt? | 403 |
| ABAC | Within limits? | 403 |
| PBAC | Document allows? | 409 |

Middleware order mirrors that table: auth → RBAC → ABAC → PBAC → handler.

## Hide Create button (React) without trusting the client

```ts
const { allowed, loading } = useCan({
  rbac,
  subject: userId,
  permission: "orders.create",
});

if (!loading && !allowed) return null;
return <CreateOrderButton />;
```

Still protect `POST /orders` with `createRequirePermission`.

## Strict unknown permissions in tests

```ts
const rbac = createRbac({
  store: createMemoryRbacStore(),
  unknownPermissionDenied: false,
});
// can("user", "typo.permission") → PermissionNotFoundError
```
