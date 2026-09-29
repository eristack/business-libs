---
name: drizzle-kit-helpers-core
description: >
  @eristack/drizzle-kit-helpers eristackProdPostgresConfig(schema) / eristackTestSqliteConfig(schema)
  / defineEristackDrizzleConfig({ dialect, schema, out, dbCredentialsEnv?, migrationsFolder? }) —
  conventional drizzle-kit configs (postgresql reads DATABASE_URL, sqlite reads SQLITE_URL, separate
  out folders per dialect) for apps composing Eristack Drizzle tables. Dev-only; URL read from env
  at call time. Not MySQL.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/drizzle-kit-helpers"
sources:
  - packages/infrastructure/drizzle-kit-helpers/docs/getting-started.md
---

# @eristack/drizzle-kit-helpers

Two configs per app, one schema file, zero drift in env names and output folders.

```ts
// drizzle.config.ts
export default defineConfig(eristackProdPostgresConfig("./src/db/schema.ts"));   // postgresql, DATABASE_URL, ./drizzle/pg
// drizzle.config.test.ts
export default defineConfig(eristackTestSqliteConfig("./src/db/schema.ts"));     // sqlite, SQLITE_URL, ./drizzle/sqlite
// custom
defineEristackDrizzleConfig({ dialect: "postgresql", schema, out, dbCredentialsEnv: "REPORTING_DATABASE_URL", migrationsFolder });
```

## Checklist

1. `schema.ts` exports Eristack tables (`createIdempotencyTables(DIALECT)`, `createOutboxTables`, `createRbacTables`, …) plus app tables with `entityIdColumn` PKs; `DIALECT` from `DRIZZLE_DIALECT` env (your convention).
2. Scripts: `db:generate`, `db:migrate`, `db:generate:test` (`DRIZZLE_DIALECT=sqlite … --config drizzle.config.test.ts`), `db:check`.
3. CI: `pnpm db:generate && git diff --exit-code drizzle/`.
4. Load `.env` before the config runs — URL is read from `process.env` at call time (empty string if unset).
5. Separate `out` folders per dialect.

## Do not

- Use for runtime connections (`drizzle(pool)` in `db.ts`).
- Point pg and sqlite at one `out` folder.
- Expect MySQL — union is `postgresql | sqlite`.
- Keep the old `dbCredentials` spread workaround (pre-0.1.x literal-string bug is fixed).
