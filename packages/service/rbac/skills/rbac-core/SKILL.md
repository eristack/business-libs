---
name: rbac-core
description: >
  Pure @eristack/rbac: createRbac, definePermission, defineRole, assignRole,
  grantPermission, can/canAny/canAll/authorize — boolean role-based permissions
  hanging off app subjects. Use for who-can-do-what without attributes or
  document policies.
metadata:
  type: core
  library: '@eristack/rbac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/rbac/docs/concepts.md'
  - 'eristack/business-libs:packages/service/rbac/docs/getting-started.md'
---

# RBAC core

Permissions are **boolean**. Roles are permission sets. Subjects are your user ids.

```ts
const rbac = createRbac({ store: createMemoryRbacStore() });
await rbac.definePermission({ name: "orders.create" });
await rbac.defineRole({ name: "clerk", permissions: ["orders.create"] });
await rbac.assignRole({ subject: userId, role: "clerk" });
await rbac.can(userId, "orders.create");
```

Not for attribute limits (ABAC) or document software policies (PBAC).
