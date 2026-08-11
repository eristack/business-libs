# Express + `@eristack/jwt-auth` (Drizzle SQLite injected)

Injection path:

1. App schema: [`src/db/schema.ts`](./src/db/schema.ts) (uses jwt-auth table helper)
2. App migrations: `pnpm db:generate` → committed under [`drizzle/`](./drizzle)
3. App opens SQLite and runs `migrate()` — [`src/db/client.ts`](./src/db/client.ts)
4. App injects `{ db, table }` into `createDrizzleRefreshTokenStore`

No hand-written `CREATE TABLE`. Schema changes go through Drizzle Kit.

## Run

```bash
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-express db:generate   # after schema changes
pnpm --filter @eristack/example-express dev
```

SQLite defaults to `data/express-jwt-auth.sqlite` (`SQLITE_PATH` to override).

## DB scripts

| Script | Purpose |
| --- | --- |
| `db:generate` | `drizzle-kit generate` from schema |
| `db:studio` | Drizzle Studio |

Startup applies pending migrations via `drizzle-orm/.../migrator`.

## Try it

```bash
curl -s http://localhost:3001/auth/issue \
  -H 'content-type: application/json' \
  -d '{"subject":"user-1","claims":{"role":"admin"}}' | jq
```

Backend for [`../react`](../react).
