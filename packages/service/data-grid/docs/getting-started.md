---
title: Getting started
description: Schema, JSON search params, TanStack Router, applyInMemory
sidebar_position: 2
---

# Getting started

```bash
pnpm add @eristack/data-grid
```

## Define a schema

```ts
import { createDataGrid, type DataGridSchema } from "@eristack/data-grid";

const schema = {
  fields: [
    { name: "id", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "status", type: "enum", filterable: true, sortable: true, enumValues: ["open", "done"] },
    { name: "createdAt", type: "date", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "createdAt", dir: "desc" }],
  defaultPageSize: 20,
  maxPageSize: 100,
} satisfies DataGridSchema;

const grid = createDataGrid(schema);
```

## Wire format (JSON search params)

Aligned with [TanStack Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params): nested values are JSON. HTTP encodes `filters` / `sorts` as JSON strings; Router keeps them as objects.

| Key | Value |
| --- | --- |
| `mode` | `"advanced"` \| `"search"` |
| `q` | free-text when `mode=search` |
| `filters` | JSON `FilterNode` when `mode=advanced` |
| `sorts` | JSON `SortClause[]` — `[{ "field": "name", "dir": "asc" }]` |
| `pageMode` | `"offset"` \| `"cursor"` |
| `page` / `pageSize` | offset paging |
| `cursor` / `limit` | cursor paging |

Example URL:

```
?mode=advanced&filters={"type":"group","logic":"and","children":[{"type":"clause","field":"status","op":"in","value":["open","done"]}]}&sorts=[{"field":"createdAt","dir":"desc"}]&page=1&pageSize=20
```

## TanStack Router

```ts
import { createDataGrid, toSearch, fromSearch, type DataGridSearch } from "@eristack/data-grid";

const grid = createDataGrid(schema);

// validateSearch returns the flat search object that lives in the URL
export const Route = createFileRoute("/orders")({
  validateSearch: (search: Record<string, unknown>): DataGridSearch =>
    toSearch(fromSearch(search, schema)),
  component: OrdersPage,
});

function OrdersPage() {
  const search = Route.useSearch();
  const query = fromSearch(search, schema);
  // navigate({ search: (prev) => ({ ...prev, page: 2 }) })
  // or navigate({ search: grid.serializeSearch(nextQuery) })
}
```

## In-memory apply

Use for small scoped lists (sessions per user, formats per entity):

```ts
const result = grid.applyInMemory(rows, req.query);
// result.items, result.pageInfo, result.query
```

## SQL lists

Use `@eristack/data-grid/drizzle` `buildDrizzleQuery` for large tables.
