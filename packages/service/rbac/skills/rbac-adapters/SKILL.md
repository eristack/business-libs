---
name: rbac-adapters
description: >
  @eristack/rbac adapters: drizzle createRbacTables + createDrizzleRbacStore
  (pgsql/mysql/sqlite), express createRequirePermission, nest RbacModule +
  RbacGuard + RequirePermission, react useCan. Use when wiring RBAC persistence
  or HTTP/UI shells.
metadata:
  type: adapter
  library: '@eristack/rbac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/rbac/docs/adapters.md'
---

# RBAC adapters

```ts
import { createRbac } from "@eristack/rbac";
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle";
import { createRequirePermission } from "@eristack/rbac/express";
import { RequirePermission, RbacModule, RbacGuard } from "@eristack/rbac/nest";

const rbac = createRbac({
  store: createDrizzleRbacStore({ db, tables: createRbacTables("pgsql") }),
});

app.post(
  "/orders",
  requireAuth,
  createRequirePermission({ rbac, permission: "orders.create" }),
  handler,
);

@RequirePermission("orders.read")
@UseGuards(RbacGuard)
@Get("orders")
list() {}
```

**Compose middleware** — auth first, then fine-grained permissions:

```ts
const requireOrdersRead = createRequirePermission({
  rbac,
  permission: "orders.read",
});
const requireOrdersCreate = createRequirePermission({
  rbac,
  permission: "orders.create",
});

app.get("/orders", requireAuth, requireOrdersRead, listOrders);
app.post("/orders", requireAuth, requireOrdersCreate, createOrder);

// Nest: stack guards — JwtAuthGuard then RbacGuard on @RequirePermission handlers
@UseGuards(JwtAuthGuard, RbacGuard)
@RequirePermission("orders.update")
@Patch("orders/:id")
update() {}
```

Permission naming: `@eristack/ai-knowledge` → `knowledge/rbac-permissions.md`.

- Drizzle dialect **`"pgsql"`**
- Express expects `req.subject` / `req.auth.subject`
- React: `useCan({ rbac, subject, permission })`
