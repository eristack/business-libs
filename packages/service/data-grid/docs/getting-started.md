---
title: Getting started
description: Install, define a schema, and return your first DataGridResult
sidebar_position: 2
---

# Getting started

This guide takes you from install to a working list endpoint. By the end you will have a schema, a parsed query, and a `{ items, pageInfo, query }` response.

## Installation

```bash
pnpm add @eristack/data-grid
```

For SQL lists, also use Drizzle in your app (the adapter does not open connections):

```bash
pnpm add drizzle-orm
# plus your driver: better-sqlite3 | postgres | mysql2 | …
```

## Define a schema

The schema is the **allow-list**. Only fields you declare can be filtered, searched, or sorted. Unknown fields and operators are rejected at parse time.

```ts
import { createDataGrid, type DataGridSchema } from "@eristack/data-grid";

export const orderGridSchema = {
  fields: [
    {
      name: "number",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    {
      name: "status",
      type: "enum",
      filterable: true,
      sortable: true,
      enumValues: ["draft", "open", "fulfilled", "cancelled"],
    },
    { name: "orderedAt", type: "date", filterable: true, sortable: true },
    {
      name: "customerName",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    { name: "totalMinor", type: "number", filterable: true, sortable: true },
    { name: "lineCount", type: "number", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "orderedAt", dir: "desc" }],
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultMode: "advanced",
} satisfies DataGridSchema;

const grid = createDataGrid(orderGridSchema);
```

Field flags:

| Flag | Meaning |
| --- | --- |
| `filterable` | Allowed in `advanced` filter clauses (default treated as off when false) |
| `sortable` | Allowed in `sorts` |
| `searchable` | Included when `mode=search` (OR `contains` across these fields) |
| `enumValues` | Documentation / UI hint for `type: "enum"` |
| `type: "decimal"` / `"money"` | Decimal **strings** for sort/filter in `applyInMemory` — never `Number()` on money columns |

> **Money columns:** Use `type: "decimal"` or `"money"` when `applyInMemory` sorts/filters string amounts (e.g. `"4990000.00"`). Keep `type: "number"` for true numeric columns (counts, page sizes). For typed `Money` compare in app code, use `@eristack/money` — the grid compares decimal strings only.

> **Important:** The schema describes the **list row** you expose — not necessarily a single database table. Relation fields (`customerName`) and aggregates (`totalMinor`) belong on the schema if the UI can filter them. See [Database](./database.md).

## Parse a query

Accept anything that looks like search params — a query string, `URLSearchParams`, a Router search object, or a partial `DataGridQuery`:

```ts
const query = grid.parse(
  'mode=advanced&filters={"type":"clause","field":"status","op":"eq","value":"open"}&page=1&pageSize=20',
);

// or
const query = grid.parse(req.query);
```

Invalid fields, operators, or JSON throw `InvalidQueryError` / `InvalidOperatorError` (HTTP adapters map these to `400`).

## Return a result

Every list path should resolve to the same shape:

```ts
type DataGridResult<T> = {
  items: T[];
  pageInfo: PageInfo;
  query: DataGridQuery; // echo of the normalized query
};
```

### Small lists (in memory)

Sessions for one user, formats for one entity — load the rows, then let core page them:

```ts
const rows = await store.listSessions(subject);
const result = grid.applyInMemory(rows, query);
// result.items / result.pageInfo / result.query
```

### SQL lists (Drizzle)

You own the `FROM` projection (joins, `SUM`, `COUNT`). The library owns where / order / limit / count:

```ts
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";

const source = orderGridSource(db); // your subquery / join

const result = await executeDrizzleList({
  dialect: "sqlite", // or "pgsql" | "mysql"
  db,
  source,
  columns: columnsFromSource(source, orderGridSchema),
  query,
  schema: orderGridSchema,
  map: mapRow, // SQL row → API DTO
});
```

## Expose it over HTTP

With Express, parse once via middleware and return the body helpers:

```ts
import {
  createDataGridMiddleware,
  toDataGridBody,
  toDataGridErrorResponse,
  applyRestResponse,
} from "@eristack/data-grid/express";

app.get(
  "/orders",
  requireAuth,
  createDataGridMiddleware(orderGridSchema),
  async (req, res) => {
    try {
      const result = await listOrders(db, req.dataGridQuery!);
      res.json(toDataGridBody(result));
    } catch (error) {
      applyRestResponse(res, toDataGridErrorResponse(error));
    }
  },
);
```

The JSON body is always `{ items, pageInfo, query }`.

## Try it

```bash
curl -sG "http://localhost:3001/orders" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'mode=advanced' \
  --data-urlencode 'filters={"type":"clause","field":"status","op":"in","value":["open","fulfilled"]}' \
  --data-urlencode 'sorts=[{"field":"totalMinor","dir":"desc"}]' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=10'
```

A full domain example (customers → orders → lines, with sums) lives in `examples/express` and `examples/react`.

## Next steps

- [Concepts](./concepts.md) — deepen the mental model
- [Querying](./querying.md) — every operator and pagination mode
- [URL & TanStack Router](./url-search.md) — keep list state in the URL
- [Database](./database.md) — projections and aggregates
