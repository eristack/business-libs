---
title: Getting started
description: Define permissions, roles, and check can()
sidebar_position: 2
---

# Getting started

From `pnpm add` to a complete define → assign → `can` / `authorize` loop with the memory store. Swap in Drizzle before anyone else uses the app.

## Installation

```bash
pnpm add @eristack/rbac
```

| Entry | Peer |
| --- | --- |
| `@eristack/rbac` | — |
| `@eristack/rbac/drizzle` | `drizzle-orm` + driver |
| `@eristack/rbac/express` | `express` |
| `@eristack/rbac/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/rbac/react` | `react` |

## Create the instance

```ts
import { createRbac, createMemoryRbacStore } from "@eristack/rbac";

const rbac = createRbac({
  store: createMemoryRbacStore(),
  // unknownPermissionDenied: true (default) → can() returns false for typos
});
```

> **Memory stores are for tests and prototypes.** They lose assignments on restart. Move to [Drizzle](./adapters.md#drizzle) for real apps.

## Define permissions and a role

Permissions must exist before a role can reference them.

```ts
await rbac.definePermission({ name: "orders.read" });
await rbac.definePermission({ name: "orders.create" });
await rbac.definePermission({
  name: "orders.approve",
  description: "Approve sales orders",
});

await rbac.defineRole({
  name: "clerk",
  permissions: ["orders.read", "orders.create"],
});

await rbac.defineRole({
  name: "manager",
  permissions: ["orders.read", "orders.create", "orders.approve"],
});
```

`definePermission` / `defineRole` upsert by name — safe to re-run at boot (see [Recipes](./recipes.md#seed-roles-at-boot)).

## Attach to an existing user

Your application owns the `users` table. `subject` is that user's id.

```ts
await rbac.assignRole({ subject: "user_1", role: "clerk" });
```

Optional direct grant (bypass roles):

```ts
await rbac.grantPermission({
  subject: "user_1",
  permission: "orders.approve",
});
```

## Check and authorize

```ts
if (await rbac.can("user_1", "orders.create")) {
  // show Create button / allow branch
}

await rbac.authorize("user_1", "orders.create");
// throws ForbiddenError when denied — use in handlers

await rbac.canAny("user_1", ["orders.create", "orders.approve"]);
await rbac.canAll("user_1", ["orders.read", "orders.create"]);
```

Inspect effective set:

```ts
const perms = await rbac.permissionsFor("user_1"); // Set<string>
const roles = await rbac.rolesFor("user_1");
```

## Revoke

```ts
await rbac.revokeRole({ subject: "user_1", role: "clerk" });
await rbac.revokePermission({
  subject: "user_1",
  permission: "orders.approve",
});
```

## Wire Express (optional)

```ts
import { createRequirePermission } from "@eristack/rbac/express";

app.post(
  "/orders",
  requireAuth, // sets req.auth.subject or req.subject
  createRequirePermission({ rbac, permission: "orders.create" }),
  handler,
);
```

## Production store

```ts
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle";
import { createRbac } from "@eristack/rbac";

const tables = createRbacTables("pgsql"); // not "pg"
const rbac = createRbac({
  store: createDrizzleRbacStore({ db, tables }),
});
```

Dialect name is **`"pgsql"`**. Details in [Adapters](./adapters.md) and [Permissions model](./permissions-model.md).

## Next steps

- [Concepts](./concepts.md) — mental model
- [Permissions model](./permissions-model.md) — graph and tables
- [Recipes](./recipes.md) — seed + stack with ABAC/PBAC
