---
name: data-grid-adapters
description: >
  @eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource
  (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery,
  rest createDataGridListAction + {items,pageInfo,query}, express middleware,
  nest DataGridModule + ParseDataGridPipe, client createDataGridClient,
  react useDataGridQuery/useDataGridList. Use when wiring list HTTP/SQL/UI shells.
metadata:
  type: adapter
  library: '@eristack/data-grid'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/service/data-grid/docs/adapters.md'
  - 'eristack/business-libs:packages/service/data-grid/src/drizzle/index.ts'
  - 'eristack/business-libs:packages/service/data-grid/src/rest/index.ts'
  - 'eristack/business-libs:packages/service/data-grid/src/react/index.ts'
---

# @eristack/data-grid — Adapters

Headless only — apps inject `db`, `fetch`, headers, and UI.

| Entry | Export |
| --- | --- |
| `/drizzle` | `executeDrizzleList`, `columnsFromSource`, `buildDrizzleQuery` (aliases OK) |
| `/rest` | `createDataGridListAction`, `toDataGridBody` |
| `/express` | `createDataGridMiddleware` |
| `/nest` | `DataGridModule`, `ParseDataGridPipe` |
| `/client` | `createDataGridClient` |
| `/react` | `useDataGridQuery`, `useDataGridList` (TanStack Query; wraps `/client`) |

Requires app-owned `QueryClientProvider`. React never calls `fetch` directly.
