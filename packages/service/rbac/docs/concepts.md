---
title: Concepts
description: Subjects, roles, boolean permissions, and the injection rule
sidebar_position: 3
---

# Concepts

Four ideas explain nearly every design decision: permissions are booleans, roles are sets, subjects are your user ids, and the library never owns infrastructure.

## Permission = boolean capability

A permission is a named capability such as `orders.create`. Either the subject has it or they do not. There is no “maybe”, no numeric limit, and no document check here.

Naming convention (majority practice):

```text
resource.action
orders.read
orders.create
orders.approve
goods-receipt.post
```

Keep names stable — they appear in DB rows, middleware, and UI. Prefer dotted resources over free prose.

## Role = set of permissions

Roles package permissions for job functions (`clerk`, `purchasing.manager`). Subjects get roles; **effective permissions** = union of all role permissions ∪ optional **direct grants**.

```text
subject user_1
  roles: clerk, auditor
  direct: reports.export
  effective = permissions(clerk) ∪ permissions(auditor) ∪ { reports.export }
```

Direct grants exist for break-glass and exceptions. Prefer roles for steady-state access.

## Subject = your user id

Same as jwt-auth: RBAC never owns users. Assign with `subject: user.id`. The package stores the string opaquely and never interprets it.

```ts
await rbac.assignRole({ subject: user.id, role: "clerk" });
await rbac.can(user.id, "orders.create");
```

## `can` vs `authorize`

| API | Denied behavior | Typical use |
| --- | --- | --- |
| `can(subject, permission)` | returns `false` | UI enable/disable, branching |
| `authorize(subject, permission)` | throws `ForbiddenError` | server handlers / middleware |
| `canAny` / `canAll` | boolean | multi-permission gates |

Unknown permissions: by default `can` returns `false` (`unknownPermissionDenied: true`). Set `unknownPermissionDenied: false` to throw `PermissionNotFoundError` instead — useful in tests that catch typos.

## Errors

| Error | When |
| --- | --- |
| `ForbiddenError` | `authorize` denied (`code: FORBIDDEN`) |
| `PermissionNotFoundError` | Role/grant references unknown permission, or unknown + strict mode |
| `RoleNotFoundError` | `assignRole` for missing role |

Express maps `ForbiddenError` → **403**. Missing subject → **401**.

## What RBAC is not

| Need | Use |
| --- | --- |
| “Only if book value ≤ 5M” | `@eristack/abac` |
| “Only if PO outstanding > 0” | `@eristack/pbac` |
| Login / JWT | `@eristack/jwt-auth` |
| Row-level SQL filters | Your query + attributes (often ABAC feeds the filter) |

## Stores are ports

Core depends on `RbacStore` only. Memory for tests; Drizzle for production; anything that implements the interface works.

```ts
type RbacStore = {
  listPermissions(): Promise<PermissionDef[]>;
  upsertPermission(def: PermissionDef): Promise<void>;
  listRoles(): Promise<RoleDef[]>;
  upsertRole(def: RoleDef): Promise<void>;
  getRole(name: RoleName): Promise<RoleDef | null>;
  listSubjectRoles(subject: SubjectId): Promise<RoleName[]>;
  assignRole(subject, role): Promise<void>;
  revokeRole(subject, role): Promise<void>;
  listSubjectPermissions(subject): Promise<PermissionName[]>;
  grantPermission(subject, permission): Promise<void>;
  revokePermission(subject, permission): Promise<void>;
};
```

## The injection rule

> **Adapters accept instances. They never construct infrastructure.**

You pass `store` into `createRbac`, `db` + tables into the Drizzle store, and the `rbac` instance into Express/Nest/React. No `process.env`, no hidden singleton.

## Next steps

- [Permissions model](./permissions-model.md) — tables and graph
- [Getting started](./getting-started.md) — working loop
- [Adapters](./adapters.md) — shells
