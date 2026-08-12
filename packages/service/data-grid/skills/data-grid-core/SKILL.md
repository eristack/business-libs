---
name: data-grid-core
description: >
  Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params
  (TanStack Router–aligned filters/sorts), toSearch/fromSearch, advanced vs
  search modes, filter ops (eq/contains/in/between/gte/…), multi-sort,
  offset/cursor pagination, applyInMemory, buildDataGridResult. Use for dynamic
  list queries without HTTP or Drizzle.
metadata:
  type: core
  library: '@eristack/data-grid'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/service/data-grid/docs/index.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/getting-started.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/concepts.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/querying.md'
  - 'eristack/business-libs:packages/service/data-grid/docs/url-search.md'
  - 'eristack/business-libs:packages/service/data-grid/src/core/create-data-grid.ts'
  - 'eristack/business-libs:packages/service/data-grid/src/core/types.ts'
---

# @eristack/data-grid — Core

Docs: Introduction, Getting started, Concepts, Querying, URL & Router.

```ts
import { createDataGrid, toSearch, fromSearch } from "@eristack/data-grid";

const grid = createDataGrid(schema);
const query = grid.parse(urlSearchParams); // JSON filters/sorts in URL
const page = grid.applyInMemory(rows, query);

const search = toSearch(query);
const again = fromSearch(search, schema);
```

## Contract

- Schema is an **allow-list** (filterable / sortable / searchable flags)
- Modes **do not mix**: `advanced` uses `filters`; `search` uses `q`
- Result envelope: `{ items, pageInfo, query }`

## URL wire (JSON)

- `filters` — JSON `FilterNode` (object in Router; string on HTTP)
- `sorts` — JSON `[{ field, dir }]`
- `mode` / `q` / `page` / `pageSize` / `pageMode` / `cursor` / `limit`

## Ops

`eq` `neq` `gt` `gte` `lt` `lte` `contains` `notContains` `startsWith` `endsWith` `in` `notIn` `between` `notBetween` `isNull` `isNotNull` `isEmpty` `isNotEmpty`
