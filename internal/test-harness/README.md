# `@internal/test-harness`

**Repo-internal only** — not under `packages/`, not published, not part of the `@eristack/*` catalog.

Shared sqlite + Drizzle helpers for integration tests in publishable packages:

- `createTestSqliteDb()` — in-memory `:memory:` database
- `execSql()` — run DDL fixtures in tests
- `canUseBetterSqlite()` — skip integration tests when native bindings are missing

Hash-chain ledger setup lives in `@eristack/hash-chained-ledger/testing` (not here) to avoid build cycles.

**Consumers:** add `"@internal/test-harness": "workspace:*"` to `devDependencies` only.

```bash
pnpm --filter @internal/test-harness build
pnpm test:integration
```
