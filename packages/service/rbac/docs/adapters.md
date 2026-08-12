---
title: Adapters
description: Drizzle, Express, Nest, React shells
sidebar_position: 4
---

# Adapters

## Drizzle

```ts
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle";
import { createRbac } from "@eristack/rbac";

const tables = createRbacTables("pgsql");
const rbac = createRbac({
  store: createDrizzleRbacStore({ db, tables }),
});
```

Dialect name is **`"pgsql"`**, not `"pg"`.

## Express

```ts
import { createRequirePermission } from "@eristack/rbac/express";

app.post(
  "/orders",
  requireAuth,
  createRequirePermission({ rbac, permission: "orders.create" }),
  handler,
);
```

Expects `req.subject` or `req.auth.subject`.

## Nest

```ts
import { RbacModule, RbacGuard, RequirePermission } from "@eristack/rbac/nest";

RbacModule.forRoot({ rbac });

@RequirePermission("orders.create")
@UseGuards(RbacGuard)
@Post()
create() { /* … */ }
```

## React

```ts
import { useCan } from "@eristack/rbac/react";

const { allowed, loading } = useCan({
  rbac,
  subject: userId,
  permission: "orders.create",
});
```
