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

- Drizzle dialect **`"pgsql"`**
- Express expects `req.subject` / `req.auth.subject`
- Nest: `@RequirePermission("…")` + `RbacGuard`
- React: `useCan({ rbac, subject, permission })`
