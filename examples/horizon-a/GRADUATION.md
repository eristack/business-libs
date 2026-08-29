# Horizon A → B graduation

Same **route paths** and handler contracts; swap Backseat memory/IndexedDB for Drizzle + Express.

## Checklist

1. Export route inventory before migration: `buildRoutesSnapshot` + `formatRoutesSnapshot` from `@eristack/backseat`.
2. Diff after Express mount: `diffRoutesSnapshots(before, after)` — paths must match.
3. Replace `createMemoryBackseatStore` with Drizzle stores per package (`./drizzle` subpaths).
4. Keep PBAC policies code-registered; use `@eristack/doc-transitions` presets instead of copy-paste tables.
5. Wire `@eristack/opinion` route table on `@eristack/rest/express` when scaffolding HTTP.
6. Epoch scopes and data-grid schemas stay identical — clients keep working.

Canonical guide: [`backseat-then-backend`](../../packages/ai/ai-knowledge/knowledge/backseat-then-backend.md).
