---
name: drizzle-app-database
description: >
  3ss B3 step 1 — app-owned Drizzle boot with @eristack/drizzle openDrizzle: one pool or sqlite
  file, dialect from APP_DB_DIALECT/DATABASE_URL, lazy drivers, redacted health location. Table
  factories stay on @eristack/*/drizzle; inject db at compose root. Step 2 schema recipe same package.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/ai-knowledge"
sources:
  - packages/ai/ai-knowledge/knowledge/drizzle-app-database.md
---

# Drizzle app database

Load `@eristack/drizzle#drizzle-core` when wiring code; this skill is the policy boundary.

1. **Never** open connections inside `@eristack/jwt-auth`, epoch, tax, or other table packages.
2. **`openDrizzle({ schema, migrationsFolder })`** once — module scope or Nest `useFactory`.
3. **`@eristack/drizzle-kit-helpers`** for two migration trees (sqlite tests, pgsql prod).
4. **B4** one collection declaration — wait until B3 step 2 column helpers exist.

```ts
const { db, location } = await openDrizzle({ schema, migrationsFolder: { sqlite: "…", pgsql: "…" } });
```
