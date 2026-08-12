---
title: Adapters
description: Drizzle, Express, Nest, React shells
sidebar_position: 5
---

# Adapters

All adapters are headless. They check permissions; they never open a database connection, mint JWTs, or render buttons.

## Layering

```text
@eristack/rbac                 core
        │
        ├── /drizzle           tables + store
        ├── /express           middleware
        ├── /nest              module + guard
        └── /react             useCan
```

## Drizzle

```ts
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle";
import { createRbac } from "@eristack/rbac";

const tables = createRbacTables("pgsql"); // "pgsql" | "mysql" | "sqlite"
const rbac = createRbac({
  store: createDrizzleRbacStore({ db, tables }),
});
```

Generate migrations from the table objects (or hand-write SQL matching the shapes in [Permissions model](./permissions-model.md)). Add FKs from `subject` to your `users.id` in app migrations.

## Express

Expects `req.subject` or `req.auth.subject` (typically set by jwt-auth middleware).

```ts
import {
  createRequirePermission,
  createRequireAnyPermission,
} from "@eristack/rbac/express";

app.post(
  "/orders",
  requireAuth,
  createRequirePermission({ rbac, permission: "orders.create" }),
  handler,
);

app.get(
  "/reports",
  requireAuth,
  createRequireAnyPermission({
    rbac,
    permissions: ["reports.read", "reports.export"],
  }),
  handler,
);
```

| Outcome | Status | Body |
| --- | --- | --- |
| Missing subject | 401 | `{ error: { code: "UNAUTHENTICATED", … } }` |
| Denied | 403 | `{ error: { code: "FORBIDDEN", … } }` |

Custom subject resolution:

```ts
createRequirePermission({
  rbac,
  permission: "orders.create",
  getSubject: (req) => req.user?.id,
});
```

## NestJS

```ts
import { RbacModule, RbacGuard, RequirePermission } from "@eristack/rbac/nest";

@Module({
  imports: [
    RbacModule.forRoot({ rbac }),
  ],
})
export class OrdersModule {}

@Post()
@RequirePermission("orders.create")
@UseGuards(RbacGuard)
create() {
  /* … */
}
```

Resolve subject the same way as Express (guard reads request subject/auth). Pair with your jwt-auth Nest guard so identity runs first.

## React

```ts
import { useCan } from "@eristack/rbac/react";

const { allowed, loading } = useCan({
  rbac,
  subject: userId,
  permission: "orders.create",
});

// <button disabled={!allowed || loading}>Create</button>
```

UI checks are hints. **Server still enforces** with middleware/guards. Never hide a mutation behind `useCan` alone.

## Injection checklist

| Layer | You inject |
| --- | --- |
| Core | `store`, optional `unknownPermissionDenied` |
| Drizzle | `db`, `tables` |
| Express / Nest | constructed `rbac` |
| React | `rbac`, `subject`, `permission` |

## Next steps

- [Recipes](./recipes.md) — seed + full stack gate
- [Permissions model](./permissions-model.md) — table details
