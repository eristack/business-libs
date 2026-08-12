---
title: Permissions model
description: Subject / role / permission graph as a child of users
sidebar_position: 4
---

# Permissions model

RBAC data is a **child of your users table**. The join key is `subject` — the same opaque string jwt-auth uses for `sub`.

## Graph

```text
users                            ← YOUR table (id, profile, tenant, …)
  id: "user_1"
     │
     │ subject
     ▼
rbac_subject_roles               ← many roles per subject
  (user_1, clerk)
  (user_1, auditor)
     │
     ▼
rbac_roles
  name: clerk
     │
     ▼
rbac_role_permissions            ← many permissions per role
  (clerk, orders.read)
  (clerk, orders.create)
     │
     ▼
rbac_permissions
  name: orders.create
  description: …

rbac_subject_permissions         ← optional direct grants (bypass roles)
  (user_1, reports.export)
```

| Entity | Owned by | Cardinality | Purpose |
| --- | --- | --- | --- |
| User | **Your app** | 1 | Identity |
| Permission | rbac | catalog | Named boolean capability |
| Role | rbac | catalog | Bundle of permissions |
| Subject↔role | rbac | 0..n | Job assignment |
| Subject↔permission | rbac | 0..n | Direct grant |

## Effective permission resolution

```text
permissionsFor(subject) =
    ∪ role.permissions for each assigned role
  ∪ direct subject permissions
```

`can(subject, p)` is membership in that set (after the unknown-permission policy). Order of roles does not matter; duplicates collapse.

## Table shapes (Drizzle)

`createRbacTables(dialect, prefix?)` builds five tables. Default prefix `rbac`:

| Table | Keys |
| --- | --- |
| `{prefix}_permissions` | PK `name` |
| `{prefix}_roles` | PK `name` |
| `{prefix}_role_permissions` | PK `(role, permission)` |
| `{prefix}_subject_roles` | PK `(subject, role)` |
| `{prefix}_subject_permissions` | PK `(subject, permission)` |

```ts
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle";

const tables = createRbacTables("pgsql");
// optional: createRbacTables("sqlite", "app_rbac")
```

Dialect: **`"pgsql"` | `"mysql"` | `"sqlite"`**.

## Foreign keys (your migration)

The library does not force a FK from `subject` → `users.id` because apps differ (UUID vs text, soft delete). **Add the FK in your migration** when you want referential integrity:

```sql
-- example
ALTER TABLE rbac_subject_roles
  ADD CONSTRAINT rbac_subject_roles_user_fk
  FOREIGN KEY (subject) REFERENCES users(id) ON DELETE CASCADE;
```

Same idea as jwt-auth credentials: child tables, app-owned parent.

## Naming conventions

| Kind | Pattern | Examples |
| --- | --- | --- |
| Permission | `resource.action` | `orders.create`, `goods-receipt.post` |
| Role | `area.job` or job | `purchasing.clerk`, `manager` |

Avoid encoding attributes in permission names (`orders.create.if_under_5m`). That belongs in ABAC. Keep RBAC names boolean and stable.

## Catalog vs runtime

- **Catalog** — `definePermission` / `defineRole` (usually seeded at boot)
- **Runtime** — `assignRole` / `grantPermission` / `can` (per request or admin UI)

Do not redefine the catalog on every request. Seed once (idempotent upserts), then assign.

## Multi-tenant note

Core is not multi-tenant-aware. If permissions differ by tenant, either:

- Scope `subject` to a tenant-qualified id your app already uses, or
- Keep separate stores / table prefixes per tenant, or
- Put tenancy in ABAC attributes and keep RBAC global to the product

Pick one and document it — do not mix silently.

## Next steps

- [Adapters](./adapters.md) — wire Drizzle + HTTP
- [Recipes](./recipes.md) — seed and stack
