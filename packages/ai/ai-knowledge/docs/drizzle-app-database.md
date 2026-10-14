---
title: Drizzle app database
description: App-owned openDrizzle boot for sqlite and Postgres, env dialect resolution, migrations, and health — Eristack table packages never open connections.
---

# Drizzle app database (3ss B3 step 1)

Eristack packages expose **table factories** under `@eristack/*/drizzle`. They **never** open connections, read `DATABASE_URL`, or run migrations. The app owns one boot path.

## `openDrizzle`

```ts
import * as schema from "./schema.js";
import { openDrizzle } from "@eristack/drizzle";

export const databasePromise = openDrizzle({
  schema,
  migrationsFolder: { sqlite: "./drizzle/sqlite", pgsql: "./drizzle/pgsql" },
});
```

Returns `{ db, dialect, location, close }`:

- **dialect** — `sqlite` | `pgsql` from `APP_DB_DIALECT`, else Postgres URL heuristic, else sqlite.
- **location** — sqlite file path or **redacted** Postgres URL (safe for `@eristack/health`).
- **Drivers** — lazy `better-sqlite3` / `pg` so Postgres deploys do not load the SQLite native module.

Pool defaults: `max: 5`, `idleTimeoutMs: 30_000`. Pass `migrate: false` in tests when you do not need migrator I/O.

## Compose schema

1. App `schema.ts` calls `createJwtAuthTables(dialect)`, `createRbacTables(dialect)`, … plus business tables.
2. `@eristack/drizzle-kit-helpers` — drizzle-kit config for two `out` folders.
3. Inject `db` into Express/Nest compose — same as `examples/express` but replace hand-rolled `createAppDatabase` with `openDrizzle`.

## Step 2 (same package, later)

Dialect-agnostic column helpers (`text`, `flag`, JSON lists) and `createEristackSpineTables(dialect)` fold in `20260925-201504` — not a second package beside the client. **B4** collection declaration waits on step 2.

## Do not

- Open Drizzle from feature packages or jwt-auth internals.
- Duplicate `createAppDatabase` in every app without reading this guide — copy `openDrizzle` once at the compose root.
