---
title: Edge cases
description: Unknown permissions, empty roles, direct grants
sidebar_position: 5
---

# Edge cases

## Unknown permission names

By default `unknownPermissionDenied` is **true**: `can(subject, "nope")` →
`false`. Set it to `false` only if you want `PermissionNotFoundError` instead
(strict catalogs during development).

## Empty role

A role with `permissions: []` is valid but grants nothing. Prefer deleting
unused roles over leaving hollow ones.

## Direct grants vs roles

`grantPermission(subject, p)` bypasses roles. Effective set is:

```text
role permissions ∪ direct subject permissions
```

Revoking a role does **not** remove a direct grant of the same permission.

## Subject is opaque

`subject` is your user id string (same idea as jwt `sub`). RBAC does not own
the users table — see [Permissions model](./permissions-model.md).

## canAny / canAll

| Helper | Semantics |
| --- | --- |
| `canAny` | true if any listed permission is granted |
| `canAll` | true only if every listed permission is granted |

Unknown permissions follow the same unknown-permission policy as `can`.

## assignRole before defineRole

`assignRole` throws `RoleNotFoundError` if the role catalog entry is missing.
Define permissions → define roles → assign.

## Multi-tenant / serverless

Scope `subject` (and optionally permission names) with your tenant strategy.
The library stores opaque strings — prefix or composite ids in the app.

On **Vercel** (or any multi-instance host), use **Drizzle + Postgres** — never
`createMemoryRbacStore`. Memory maps are not shared across cold starts.

## Next

- [Permissions model](./permissions-model.md)
- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
