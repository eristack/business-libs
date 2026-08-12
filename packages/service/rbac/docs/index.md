---
title: Overview
description: Boolean role-based permissions for Eristack services
sidebar_position: 1
---

# @eristack/rbac

Every business API eventually asks: may **this user** perform **this action**? The answer is a boolean. Roles and permission names are how you package that answer without sprinkling string checks through controllers.

`@eristack/rbac` is the canonical boolean gate. The core is pure: define permissions, define roles, assign roles (or direct grants) to a **subject**, then `can` / `authorize`. Adapters wrap Drizzle, Express, Nest, and React — by injection, never by inventing a users table.

## What it answers

> Does this **subject** have this **permission**?

Always **true or false**. No attributes, no document state — that is [`@eristack/abac`](/docs/abac) / [`@eristack/pbac`](/docs/pbac).

## What it is

- **Permissions** — opaque names, convention `resource.action` (`orders.create`)
- **Roles** — named sets of permissions (`purchasing.clerk`)
- **Subject** — your user id (same idea as jwt-auth `subject`)
- **Effective set** — union of role permissions ∪ optional direct grants
- **Headless adapters** — Drizzle tables/store, Express middleware, Nest guard, React `useCan`

## What it is not

| Not this | Because |
| --- | --- |
| A `users` table | Your app owns users. RBAC attaches via `subject`. |
| Attribute limits | Book-value caps → `@eristack/abac` |
| Document rules | PO outstanding → `@eristack/pbac` |
| Login / JWT | Identity → `@eristack/jwt-auth` |
| A UI kit | `/react` ships a hook — zero widgets |

> **The one rule to remember:** RBAC is a **child of your users** via `subject`. There is no `createUser`. See [Permissions model](./permissions-model.md).

## Layers

```text
@eristack/rbac                      core — createRbac: define / assign / can / authorize
        │
        ├── /drizzle                createRbacTables + createDrizzleRbacStore
        ├── /express                createRequirePermission (+ any)
        ├── /nest                   RbacModule + RbacGuard + @RequirePermission
        └── /react                  useCan
```

## Graph

```text
users (yours)
  id: user_1
     │ subject
     ▼
rbac_subject_roles ──► rbac_roles ──► rbac_role_permissions ──► rbac_permissions
rbac_subject_permissions ─────────────────────────────────────► (direct grants)
```

## A minute of code

```ts
import { createRbac, createMemoryRbacStore } from "@eristack/rbac";

const rbac = createRbac({ store: createMemoryRbacStore() });

await rbac.definePermission({ name: "orders.create" });
await rbac.defineRole({
  name: "clerk",
  permissions: ["orders.create"],
});
await rbac.assignRole({ subject: "user_1", role: "clerk" });

if (await rbac.can("user_1", "orders.create")) {
  // …
}

await rbac.authorize("user_1", "orders.create"); // throws ForbiddenError
```

## Stack with ABAC / PBAC

```text
RBAC  →  may this subject attempt the action?     (403 if not)
ABAC  →  within attribute limits?                 (403 if not)
PBAC  →  does document state allow it?            (409 if not)
```

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Getting started](./getting-started.md) | Define → assign → can loop |
| [Concepts](./concepts.md) | Boolean model, errors, injection |
| [Permissions model](./permissions-model.md) | Subject/role/permission graph |
| [Adapters](./adapters.md) | Drizzle, Express, Nest, React |
| [Recipes](./recipes.md) | Seed roles, stack with ABAC/PBAC |

## Related packages

- [`@eristack/jwt-auth`](/docs/jwt-auth) — identity (`subject`)
- [`@eristack/abac`](/docs/abac) — attribute policies
- [`@eristack/pbac`](/docs/pbac) — document software policies
