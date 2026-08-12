---
title: Concepts
description: Schema, query, result, and the advanced vs search modes
sidebar_position: 3
---

# Concepts

Before wiring adapters, lock the three types that travel through the stack: **schema**, **query**, and **result**.

## The schema is an allow-list

A `DataGridSchema` answers: *what may the client ask for?*

```ts
type DataGridSchema = {
  fields: readonly DataGridFieldDef[];
  defaultSorts?: readonly SortClause[];
  defaultPageSize?: number;
  maxPageSize?: number;
  defaultMode?: "advanced" | "search";
  defaultPageMode?: "offset" | "cursor";
};
```

Each field carries a type and capability flags:

```ts
type DataGridFieldDef = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  filterable?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  enumValues?: readonly string[];
};
```

Parse rejects:

- Fields that are not `filterable` / `sortable` as used
- Operators that are not in the supported set
- Malformed filter JSON

That is deliberate. List APIs should fail closed — not silently ignore unknown params.

### Schema describes the row shape, not the table

If the UI filters on `customerName` or `totalMinor`, those names belong on the schema — even when SQL computes them via join / `SUM`. The schema and your Drizzle projection must agree on field names. See [Database](./database.md).

## The query is normalized

After parse, everything is a `DataGridQuery`:

```ts
type DataGridQuery = {
  mode: "advanced" | "search";
  filters?: FilterNode; // advanced only
  search?: string;      // search only (from `q`)
  sorts: SortClause[];
  page: OffsetPage | CursorPage;
};
```

You can hand-build this object in tests or server code. `createDataGrid(schema).parse(input)` is the usual path from the wire.

### Advanced vs search — separate modes

| Mode | Uses | Ignores |
| --- | --- | --- |
| `advanced` | `filters` tree | `q` / `search` |
| `search` | `q` → OR `contains` on `searchable` fields | `filters` |

They are not combined. A common product mistake is “search box plus sidebar filters” as one intertwined query. In data-grid you pick a mode (or switch modes in the UI). That keeps SQL and in-memory semantics identical and avoids surprising AND/OR precedence bugs.

When `mode` is omitted, `defaultMode` on the schema applies (`advanced` if unset).

## The result is always the same envelope

```ts
type DataGridResult<T> = {
  items: T[];
  pageInfo: PageInfo;
  query: DataGridQuery;
};
```

Echoing `query` matters: the client can render “active filters” from the server’s normalized view, not from a half-parsed URL. HTTP bodies use the same envelope via `toDataGridBody(result)`.

### Offset pageInfo

```ts
{
  mode: "offset",
  page: 2,
  pageSize: 20,
  total: 87,
  totalPages: 5,
  hasNext: true,
  hasPrev: true,
}
```

### Cursor pageInfo

```ts
{
  mode: "cursor",
  limit: 20,
  nextCursor: "…",
  prevCursor: null,
  hasNext: true,
  hasPrev: false,
}
```

In-memory apply builds real next cursors from sort keys. `executeDrizzleList` currently focuses on **offset** totals; cursor mode returns items with inferred `hasNext` from page length unless you layer keyset SQL yourself with the lower-level builders.

## Core vs adapters

| Layer | Import | Responsibility |
| --- | --- | --- |
| Core | `@eristack/data-grid` | Schema, parse/serialize, in-memory apply, `buildDataGridResult` |
| Drizzle | `@eristack/data-grid/drizzle` | `WHERE` / `ORDER BY` / `executeDrizzleList` |
| REST | `@eristack/data-grid/rest` | Framework-free request parse + body helpers |
| Express / Nest | `…/express`, `…/nest` | Middleware / module / pipe |
| Client | `…/client` | Framework-agnostic HTTP |
| React | `…/react` | TanStack Query hooks over `/client` |

Core never imports Express, Nest, React, or Drizzle. Adapters never invent a second query dialect.

## Factory: `createDataGrid`

```ts
const grid = createDataGrid(schema);

grid.parse(input);
grid.toSearch(query);       // Router-friendly object
grid.fromSearch(search);
grid.serialize(query);      // URLSearchParams (JSON nested)
grid.serializeString(query);
grid.serializeSearch(query); // navigate({ search })
grid.applyInMemory(rows, input);
```

Standalone functions (`parseQuery`, `toSearch`, `fromSearch`, `buildDataGridResult`, …) are also exported for tree-shaking and adapter use.
