# Suggestion: Drizzle BackseatStore.atomic for better-sqlite3 (staged flush)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201500-suggestion-drizzle-backseat-store-atomic-sqlite-staging-a1b2c3`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `partial`
- **created:** 2026-09-25T20:15:00.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B uses `createDrizzleBackseatStore` with better-sqlite3. Calling `db.transaction(async (trx) => work(inner))` throws: `Transaction function cannot return a promise`. Consumers must reinvent staging writes + sync flush. Ship a first-party Drizzle adapter with tested `atomic()` per dialect.

## User story

As a Backseat-first ERP moving to SQLite/Postgres I want `store.atomic()` to work the same as IndexedDB Backseat without reading Drizzle driver caveats.

## Proposed behavior

- **sqlite (better-sqlite3):** `atomic(work)` runs async `work(stagingTx)` against an overlay; on success, applies staged upserts/deletes in a **sync** `sqlite.transaction()`.
- **pgsql:** May use async Drizzle transaction when `work` is async—document supported matrix.
- Golden test: seed geography + create job + cost sheet in one `atomic()`; failure mid-work rolls back staged flush.

## Proposed API

```ts
createDrizzleBackseatStore(db, { dialect: 'sqlite' | 'pgsql' }): BackseatStore
// atomic() behavior documented per dialect
```

## Feasibility rationale

Additive adapter; consumer already proved staging pattern. Postgres path may differ from SQLite.

## Implementation sketch

- Export from `@eristack/backseat/drizzle` (or existing drizzle path).
- Reuse `TransactionalStore` shape; staging `set`/`create`/`update`/`delete` buffers ops.
- Unit tests with better-sqlite3; optional pg integration test in CI.
- Docs: epoch bump **after** atomic (unchanged); cannot span separate Drizzle DB handles.

## Risks

- Consumers assuming old broken async txn behavior.
- Large staged batches memory use during seed scripts.

## Alternatives

- Document-only “do not use async txn on sqlite” — every app copies staging.
- Force sync-only handlers inside atomic — breaks legitimate async master lookups in `work`.

## Agent handoff

1. Load Intent skills for `@eristack/backseat`.
2. Implement adapter + tests; prefer additive exports.
3. Update `upgrading-eristack` / backseat-then-backend recipe.
4. Run `pnpm knowledge:sync` when skills change.
5. Changeset for user-facing adapter behavior.

## Notes

Sprint: `2026-09-25-derive-backend-ports-drizzle-express`. Related shipped ticket: `20260827-140852-suggestion-atomic-multi-collection-writes-for-document-aggr-91d521` (IDB `atomic()` exists; Drizzle sqlite gap remains).

### Consumer evidence (Tiga Sekawan)

- `packages/db/src/backseat-document-store.ts` — `flushStagedWrites` + `createStagingTransactionalStore`.
- `pnpm --filter @tiga-sekawan/api reseed` failed until staging fix (multi-collection seed via `store.atomic`).

### Sibling tickets (2026-09-25 batch)

See `.eristack/tickets/20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
