# NestJS + `@eristack/jwt-auth` (Drizzle SQLite injected)

Injection path:

1. App schema: [`src/database/schema.ts`](./src/database/schema.ts)
2. App migrations: `pnpm db:generate` → committed under [`drizzle/`](./drizzle)
3. `DatabaseModule` opens SQLite and runs Drizzle `migrate()`
4. `JwtAuthModule.registerAsync` injects that `db` into `createDrizzleRefreshTokenStore`

No hand-written `CREATE TABLE`.

## Run

```bash
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-nestjs db:generate   # after schema changes
pnpm --filter @eristack/example-nestjs dev
```

SQLite defaults to `data/nestjs-jwt-auth.sqlite` (`SQLITE_PATH` to override).

## DB scripts

| Script | Purpose |
| --- | --- |
| `db:generate` | `drizzle-kit generate` from schema |
| `db:studio` | Drizzle Studio |

## Try it

```bash
curl -s http://localhost:3002/auth/issue \
  -H 'content-type: application/json' \
  -d '{"subject":"user-1","claims":{"role":"admin"}}' | jq
```
