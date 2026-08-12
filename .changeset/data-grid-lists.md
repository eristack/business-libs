---
"@eristack/data-grid": minor
"@eristack/jwt-auth": minor
"@eristack/doc-number": minor
---

Add `@eristack/data-grid` for schema-aware list queries (advanced filters vs search mode, multi-sort, offset/cursor pagination) with drizzle/rest/express/nest/client/react adapters.

Filter URLs use TanStack Router–style JSON search params (`filters` / `sorts` as JSON); `toSearch` / `fromSearch` for Router `validateSearch`. Drizzle adapter includes `executeDrizzleList` / `columnsFromSource` so apps only supply the projection (see `examples/express` orders grid).

**Breaking:** `jwt-auth` `listSessions` and `doc-number` `listFormats` (plus REST/client) now return `DataGridResult` (`{ items, pageInfo, query }`) and accept optional data-grid query input.
