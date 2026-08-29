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

- Drizzle dialect **`"pgsql"`**
- Express expects `req.subject` / `req.auth.subject`
- React: `useCan({ rbac, subject, permission })`
