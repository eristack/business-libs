---
title: Querying
description: Filters, operators, search mode, sorting, and pagination
sidebar_position: 4
---

# Querying

This page is the reference for everything that goes into a `DataGridQuery`: filter trees, operators, free-text search, sorts, and pagination.

## Filter trees

Advanced mode uses a recursive `FilterNode`:

```ts
type FilterClause = {
  type: "clause";
  field: string;
  op: FilterOp;
  value?: unknown;
};

type FilterGroup = {
  type: "group";
  logic: "and" | "or";
  children: FilterNode[];
};

type FilterNode = FilterClause | FilterGroup;
```

A single clause:

```json
{ "type": "clause", "field": "status", "op": "eq", "value": "open" }
```

A group (status in list **and** total at least 50_000 minor units):

```json
{
  "type": "group",
  "logic": "and",
  "children": [
    {
      "type": "clause",
      "field": "status",
      "op": "in",
      "value": ["open", "fulfilled"]
    },
    {
      "type": "clause",
      "field": "totalMinor",
      "op": "gte",
      "value": 50000
    }
  ]
}
```

Groups nest arbitrarily. Prefer shallow trees in UI builders; deep trees are valid for power users and saved views.

## Available operators

| Operator | Value | Notes |
| --- | --- | --- |
| `eq` / `neq` | scalar | Equality |
| `gt` / `gte` / `lt` / `lte` | scalar | Ordered compare (numbers, dates, strings) |
| `contains` / `notContains` | string | Substring; SQL uses `LIKE` / `ILIKE` (pgsql) |
| `startsWith` / `endsWith` | string | Prefix / suffix |
| `in` / `notIn` | array (or `a\|b` string on some paths) | Membership |
| `between` / `notBetween` | `[min, max]` | Inclusive range |
| `isNull` / `isNotNull` | — | NULL checks |
| `isEmpty` / `isNotEmpty` | — | NULL or empty string |

Examples:

```ts
{ type: "clause", field: "name", op: "contains", value: "acme" }
{ type: "clause", field: "age", op: "between", value: [18, 65] }
{ type: "clause", field: "region", op: "in", value: ["eu", "apac"] }
{ type: "clause", field: "notes", op: "isEmpty" }
```

On Drizzle, string containment escapes `%` / `_` and uses case-insensitive match on PostgreSQL (`ilike`).

## Search mode

Set `mode` to `search` and provide `q` (wire) / `search` (normalized):

```
?mode=search&q=sakura&page=1&pageSize=20
```

Semantics: **OR** of `contains` across every field marked `searchable: true`. Structured `filters` are ignored.

Use search for a global box. Use advanced for faceted filters. Switching modes in the UI should clear the inactive side so users are not surprised.

## Sorting

`sorts` is an ordered list — first clause wins, then ties break on the next:

```json
[
  { "field": "totalMinor", "dir": "desc" },
  { "field": "orderedAt", "dir": "desc" }
]
```

If the client omits sorts (or sends an empty list), `defaultSorts` from the schema are applied.

Only `sortable` fields are accepted.

## Pagination

### Offset (default)

```ts
page: { mode: "offset", page: 1, pageSize: 20 }
```

Wire keys: `page`, `pageSize` (and optional `pageMode=offset`).

- `page` is **1-based**
- `pageSize` is clamped to `maxPageSize` (default max 100)
- Missing size falls back to `defaultPageSize` (default 20)

`pageInfo` includes `total` and `totalPages` so UIs can render classic pagers.

### Cursor

```ts
page: { mode: "cursor", cursor: null, limit: 20 }
```

Wire keys: `pageMode=cursor`, `cursor`, `limit`.

In-memory apply encodes the next cursor from the last row’s sort keys. Prefer offset for admin tables with total counts; prefer cursor for infinite scroll once your SQL projection supports keyset predicates (compose with `buildWhere` / `buildOrderBy` if you need custom keyset SQL beyond `executeDrizzleList`).

## Building queries in application code

You do not have to go through a URL:

```ts
import { createDataGrid } from "@eristack/data-grid";

const grid = createDataGrid(schema);

const result = grid.applyInMemory(rows, {
  mode: "advanced",
  filters: {
    type: "group",
    logic: "and",
    children: [
      { type: "clause", field: "status", op: "eq", value: "open" },
      { type: "clause", field: "totalMinor", op: "gte", value: 10_000 },
    ],
  },
  sorts: [{ field: "orderedAt", dir: "desc" }],
  page: { mode: "offset", page: 1, pageSize: 10 },
});
```

`parse` also accepts this object form and re-validates against the schema.

## Errors

| Error | When |
| --- | --- |
| `InvalidQueryError` | Bad JSON, unknown field, bad page values, invalid group logic |
| `InvalidOperatorError` | Operator not in the supported set |

REST / Express / Nest map these to HTTP `400` with `{ error: { code, message } }`.
