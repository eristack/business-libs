---
title: Getting started
description: Define permissions, roles, and check can()
sidebar_position: 3
---

# Getting started

```ts
import { createRbac, createMemoryRbacStore } from "@eristack/rbac";

const rbac = createRbac({ store: createMemoryRbacStore() });

await rbac.definePermission({ name: "orders.read" });
await rbac.definePermission({ name: "orders.create" });

await rbac.defineRole({
  name: "clerk",
  permissions: ["orders.read", "orders.create"],
});

await rbac.assignRole({ subject: "user_1", role: "clerk" });

if (await rbac.can("user_1", "orders.create")) {
  // …
}

await rbac.authorize("user_1", "orders.create");
```

Production: use `createRbacTables("pgsql")` + `createDrizzleRbacStore` from
`@eristack/rbac/drizzle`.
