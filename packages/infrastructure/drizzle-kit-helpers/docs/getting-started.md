---
title: Getting started
description: A schema.ts that composes Eristack package tables with your own, pg and sqlite drizzle-kit configs, package scripts, a CI drift check, and how to keep one schema valid for both dialects.
---

# Getting started

## Install

```bash
pnpm add -D @eristack/drizzle-kit-helpers drizzle-kit
pnpm add drizzle-orm pg                 # runtime
pnpm add -D better-sqlite3              # tests
```

## One `schema.ts`, two dialects

Eristack tables take the dialect as an argument, so keep the dialect in one place and derive everything:

```ts
// src/db/schema.ts
import { createIdempotencyTables } from "@eristack/idempotency/drizzle";
import { createOutboxTables } from "@eristack/outbox/drizzle";
import { createRbacTables } from "@eristack/rbac/drizzle";
import { entityIdColumn } from "@eristack/entity-id/drizzle";
import { pgTable, text } from "drizzle-orm/pg-core";

export const DIALECT = (process.env.DRIZZLE_DIALECT ?? "pgsql") as "pgsql" | "sqlite";

// Eristack-owned tables
export const idempotency = createIdempotencyTables(DIALECT);
export const outbox = createOutboxTables(DIALECT);
export const rbac = createRbacTables(DIALECT);

// App-owned tables (pg shown; see "both dialects" below)
export const purchaseOrders = pgTable("purchase_orders", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  // …
});
```

## Configs

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { eristackProdPostgresConfig } from "@eristack/drizzle-kit-helpers";
export default defineConfig(eristackProdPostgresConfig("./src/db/schema.ts"));
```

```ts
// drizzle.config.test.ts
import { defineConfig } from "drizzle-kit";
import { eristackTestSqliteConfig } from "@eristack/drizzle-kit-helpers";
export default defineConfig(eristackTestSqliteConfig("./src/db/schema.ts"));
```

```json
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:generate:test": "DRIZZLE_DIALECT=sqlite drizzle-kit generate --config drizzle.config.test.ts",
    "db:check": "drizzle-kit check && DRIZZLE_DIALECT=sqlite drizzle-kit check --config drizzle.config.test.ts"
  }
}
```

`.env`:

```
DATABASE_URL=postgres://app:app@localhost:5432/app
SQLITE_URL=file:./.data/test.sqlite
```

## Custom env var or migrations folder

```ts
import { defineEristackDrizzleConfig } from "@eristack/drizzle-kit-helpers";

export default defineConfig(
  defineEristackDrizzleConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle/pg",
    dbCredentialsEnv: "REPORTING_DATABASE_URL",
    migrationsFolder: "./drizzle/pg/migrations",
  }),
);
```

## CI: fail on schema drift

```yaml
- run: pnpm db:generate && git diff --exit-code drizzle/
```

If someone edits `schema.ts` without committing the generated SQL, CI fails with the diff. Pair with `pnpm db:check` for drizzle-kit's own consistency check.

## Both dialects from one schema file

Eristack tables already branch on dialect. For your own tables you have two options:

1. **pg-only app tables, sqlite only for Eristack tests.** Simplest: integration tests for *your* tables run against Postgres (Testcontainers / Neon branch); SQLite covers package-level tests.
2. **Dialect-switched app tables.** Write a tiny factory like the Eristack packages do:

```ts
export function createAppTables(dialect: "pgsql" | "sqlite") {
  if (dialect === "sqlite") {
    return { purchaseOrders: sqliteTable("purchase_orders", { id: entityIdColumn("sqlite", "id").primaryKey(), /* … */ }) };
  }
  return { purchaseOrders: pgTable("purchase_orders", { id: entityIdColumn("pgsql", "id").primaryKey(), /* … */ }) };
}
export const app = createAppTables(DIALECT);
```

Types stay identical (`text`, `integer`, entity ids); avoid pg-only column types (`jsonb`, `timestamp with time zone`) in tables you want under SQLite, or map them in the factory.

## Gotchas

- `dbCredentials.url` is read when the config function **runs**. Import `dotenv/config` first (or rely on drizzle-kit's built-in dotenv) — otherwise you get an empty URL and a confusing connection error.
- Prior to `0.1.x` the helpers returned the literal string `"process.env.DATABASE_URL"`; if you spread `dbCredentials` manually to work around that, you can remove the override.
- Two configs → two `out` folders (`drizzle/pg`, `drizzle/sqlite`). Never point both at one folder; drizzle-kit's journal is per dialect.
- `migrations.folder` is only for `drizzle-kit migrate`; `generate` writes to `out` regardless.
- `DRIZZLE_DIALECT` in the schema file is a convention of this guide, not of the package — drizzle-kit does not pass the dialect into your schema, so you have to.
- MySQL is not covered; the union is `postgresql | sqlite`.

## Testing

```ts
import { eristackProdPostgresConfig, eristackTestSqliteConfig } from "@eristack/drizzle-kit-helpers";
import { expect, it } from "vitest";

it("reads the URL from env", () => {
  process.env.DATABASE_URL = "postgres://x";
  expect(eristackProdPostgresConfig("./schema.ts").dbCredentials.url).toBe("postgres://x");
  expect(eristackTestSqliteConfig("./schema.ts").out).toBe("./drizzle/sqlite");
});
```
