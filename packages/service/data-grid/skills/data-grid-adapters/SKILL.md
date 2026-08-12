---
name: data-grid-adapters
description: >
  @eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource
  (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery,
  rest createDataGridListAction + {items,pageInfo,query}, express middleware,
  nest DataGridModule + ParseDataGridPipe, client createDataGridClient,
  react useDataGridController (draft/commit filter rows) + useDataGridList.
  Use when wiring list HTTP/SQL/UI shells.
metadata:
  type: adapter
  library: '@eristack/data-grid'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/service/data-grid/docs/database.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/http-and-ui.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/recipes.md'
  - 'eristack/business-libs:packages/service/data-grid/src/drizzle/index.ts'
  - 'eristack/business-libs:packages/service/data-grid/src/rest/index.ts'
  - 'eristack/business-libs:packages/service/data-grid/src/react/index.ts'
---

# @eristack/data-grid — Adapters

Docs: Database (Drizzle), HTTP & UI, Recipes. Headless only — apps inject `db`, `fetch`, headers, and UI.

| Entry | Export |
| --- | --- |
| `/drizzle` | `executeDrizzleList`, `columnsFromSource`, `buildDrizzleQuery` |
| `/rest` | `createDataGridListAction`, `toDataGridBody` |
| `/express` | `createDataGridMiddleware` |
| `/nest` | `DataGridModule`, `ParseDataGridPipe` |
| `/client` | `createDataGridClient` |
| `/react` | `useDataGridController`, `useDataGridList` (draft/commit + TanStack Query; wraps `/client`) |

**Split:** app owns the SQL projection (joins / `SUM` / `COUNT`); library runs filter/sort/count/page via `executeDrizzleList`.

Requires app-owned `QueryClientProvider`. React never calls `fetch` directly.
