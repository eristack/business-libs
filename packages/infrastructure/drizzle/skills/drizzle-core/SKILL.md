---
name: drizzle-core
description: >
  @eristack/drizzle app-owned boot: openDrizzle({ schema, migrationsFolder, pool }) →
  { db, dialect, location, close } with lazy better-sqlite3/pg, APP_DB_DIALECT or DATABASE_URL
  resolution, migrate per dialect, redacted Postgres URL for health. App calls once — Eristack
  table packages never open connections. Step 2 schema recipe ships here later (3ss B3).
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/drizzle"
sources:
  - packages/infrastructure/drizzle/docs/getting-started.md
---

# @eristack/drizzle

```ts
const { db, dialect, location, close } = await openDrizzle({
  schema,
  migrationsFolder: { sqlite: "./drizzle/sqlite", pgsql: "./drizzle/pgsql" },
});
```

## Checklist

1. Compose `@eristack/*/drizzle` tables in app `schema.ts`; pass that object as `schema`.
2. Two migration folders when you support sqlite tests + Postgres prod (`@eristack/drizzle-kit-helpers`).
3. Register `location` + `dialect` on `@eristack/health` readiness — never log raw `DATABASE_URL`.
4. Inject `db` into jwt-auth stores, data-grid `executeDrizzleList`, domain services — no package opens its own pool.

## Do not

- Use inside published `@eristack/*` drizzle table modules.
- Start B4 collection codegen before B3 step 2 schema helpers exist.
