---
title: Overview
description: Shared drizzle-kit config fragments — Postgres for production, SQLite for tests — so every Eristack app's drizzle.config.ts reads the same env vars and writes migrations to the same folders.
---

# @eristack/drizzle-kit-helpers

Every Eristack app has two `drizzle-kit` configurations: **Postgres** for real environments and **SQLite** for fast integration tests. Written by hand they drift — different env var names, different `out` folders, one repo forgetting `migrations.folder`. `@eristack/drizzle-kit-helpers` exports the two conventional configs (and the builder behind them) so the differences between apps are only `schema` path and nothing else.

Dev-dependency only. Nothing here runs at request time.

## Use it when

- Creating `drizzle.config.ts` / `drizzle.config.test.ts` in an app that uses Eristack Drizzle adapters.
- Standardising env var names (`DATABASE_URL`, `SQLITE_URL`) across a monorepo of services.
- Generating migrations for the tables Eristack packages create (`createIdempotencyTables`, `createOutboxTables`, `createRbacTables`, …).

## Not for

- Runtime DB connections — `drizzle(pool)` in your `db.ts`.
- MySQL — the dialect union is `"postgresql" | "sqlite"` today; write a plain `defineConfig` for MySQL.
- Multi-schema / multi-database setups — extend the returned object.

## Install

```bash
pnpm add -D @eristack/drizzle-kit-helpers drizzle-kit
```

No peers (`drizzle-kit` is yours).

## 30-second example

```ts
// drizzle.config.ts (production migrations)
import { defineConfig } from "drizzle-kit";
import { eristackProdPostgresConfig } from "@eristack/drizzle-kit-helpers";

export default defineConfig(eristackProdPostgresConfig("./src/db/schema.ts"));
// → { dialect: "postgresql", schema: "./src/db/schema.ts", out: "./drizzle/pg",
//     dbCredentials: { url: process.env.DATABASE_URL ?? "" } }
```

```ts
// drizzle.config.test.ts (integration tests)
import { defineConfig } from "drizzle-kit";
import { eristackTestSqliteConfig } from "@eristack/drizzle-kit-helpers";

export default defineConfig(eristackTestSqliteConfig("./src/db/schema.ts"));
// → { dialect: "sqlite", …, out: "./drizzle/sqlite", dbCredentials: { url: process.env.SQLITE_URL ?? "" } }
```

```bash
pnpm drizzle-kit generate                                  # pg
pnpm drizzle-kit generate --config drizzle.config.test.ts  # sqlite
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `eristackProdPostgresConfig` | `(schemaPath: string, out = "./drizzle/pg") => config` | `dialect: "postgresql"`, URL from `DATABASE_URL`. |
| `eristackTestSqliteConfig` | `(schemaPath: string, out = "./drizzle/sqlite") => config` | `dialect: "sqlite"`, URL from `SQLITE_URL`. |
| `defineEristackDrizzleConfig` | `({ dialect, schema, out, migrationsFolder?, dbCredentialsEnv? }) => config` | The builder. `dbCredentialsEnv` defaults to `DATABASE_URL` (pg) / `SQLITE_URL` (sqlite). `migrationsFolder` adds `migrations: { folder }`. |
| `DefineEristackDrizzleConfigOptions` | as above | |
| `EristackDrizzleDialect` | `"postgresql" \| "sqlite"` | |

The returned object is a plain `as const` literal compatible with `drizzle-kit`'s `defineConfig`. `dbCredentials.url` is **read at call time** from `process.env` (empty string when unset — drizzle-kit then errors clearly). Load `.env` before importing the config (`drizzle-kit` does this automatically when `dotenv` is installed).

## Works with

- Every `@eristack/*/drizzle` subpath — export their `create*Tables(dialect)` from `schema.ts` so `generate` sees them.
- `@eristack/entity-id` — `entityIdColumn(dialect, "id")` for PKs in your own tables.
- `@internal/test-harness` (repo) / your own SQLite helper — run migrations from `./drizzle/sqlite` before tests.
- `@eristack/vercel-adapters` — same `DATABASE_URL` the function reads.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/drizzle-kit-helpers#drizzle-kit-helpers-core`
- Recipe: `drizzle-kit-monorepo`.

## Next

- [Getting started](./getting-started.md) — schema file that includes Eristack tables, both configs, package scripts, CI migration check, and dialect-specific schema tips.
