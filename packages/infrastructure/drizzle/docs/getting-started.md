---
title: Getting started
description: Install openDrizzle, resolve sqlite vs Postgres from env, run dialect-specific migrations, and wire health checks with a redacted location string.
---

# Getting started

Pair with `@eristack/drizzle-kit-helpers` for drizzle-kit configs and `@eristack/health` for readiness probes. Working sample: `examples/express/src/db/client.ts` (`bootAppDatabase` → `openDrizzle`).

## Install

```bash
pnpm add @eristack/drizzle drizzle-orm
pnpm add better-sqlite3          # local / tests
pnpm add pg                      # production Postgres
```

Peers: install **only** the driver you deploy with. Postgres deploys must not require `better-sqlite3` at runtime — `openDrizzle` lazy-imports drivers.

## Boot once at module scope

```ts
import * as schema from "./schema.js";
import { openDrizzle } from "@eristack/drizzle";

export const databasePromise = openDrizzle({
  schema,
  migrationsFolder: {
    sqlite: "./drizzle/sqlite",
    pgsql: "./drizzle/pgsql",
  },
});

// Express / Nest factory
const { db, dialect, location, close } = await databasePromise;
```

### Env conventions

| Variable | Role |
| --- | --- |
| `APP_DB_DIALECT` | `sqlite` or `pgsql` when set |
| `DATABASE_URL` | Postgres connection string; also infers `pgsql` when dialect unset |
| `SQLITE_PATH` | SQLite file when dialect is sqlite |

Defaults: sqlite file `data/app.sqlite` under `process.cwd()`, pool `max: 5`, `idleTimeoutMs: 30_000`.

### Health

```ts
import { registerCheck } from "@eristack/health";

registerCheck("database", async () => {
  const { location, dialect } = await databasePromise;
  return { ok: true, dialect, location }; // location is redacted for Postgres
});
```

## Typing note

`openDrizzle` returns `DrizzleAppDatabase<TSchema>` (`sqlite` or `node-postgres`). Apps that share handlers across dialects often cast to one Drizzle type after boot — same pattern as Tiga Sekawan `packages/db`. Step 2 schema helpers reduce that cast surface.

## Do not

- Call `openDrizzle` from `@eristack/jwt-auth`, `@eristack/epoch`, or other table packages.
- Open a second pool inside adapters — inject `db` from the app compose root.

## Exports

`openDrizzle`, `resolveAppDbDialect`, `redactDatabaseLocation`, and related option/result types.
