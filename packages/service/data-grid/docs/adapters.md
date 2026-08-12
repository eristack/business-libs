---
title: Adapters
description: Drizzle, REST, Express, Nest, client, React
sidebar_position: 3
---

# Adapters

All adapters are **headless** — inject DB / fetch / headers / `QueryClient` yourself.

## Layering

```text
core → drizzle
     → rest → express | nest
     → client → react (TanStack Query / Form)
```

`/client` is framework-agnostic HTTP (Vue/Svelte can wrap it later).
`/react` only talks to `/client` — never `fetch`.

## Drizzle

```ts
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";

// App owns the projection (joins / SUM / COUNT). Library runs filter+sort+page.
const source = orderGridSource(db); // `.as("order_grid")` subquery

const result = await executeDrizzleList({
  dialect: "sqlite",
  db,
  source,
  columns: columnsFromSource(source, schema),
  query,
  schema,
  map: mapRow, // optional
});
// result.items / result.pageInfo / result.query
```

`ColumnMap` accepts table columns **or** SQL aliases. Lower-level helpers (`buildWhere`, `buildDrizzleQuery`) remain available when you need custom execution.

See `examples/express/src/orders` for a full customers → orders → lines projection.
## REST / Express / Nest

Parse query params → `{ items, pageInfo, query }` bodies.

## Client

```ts
import { createDataGridClient } from "@eristack/data-grid/client";

const client = createDataGridClient({ baseUrl, path, schema });
await client.list("mode=search&q=ada");
```

## React (TanStack Query)

App must wrap with `QueryClientProvider`.

```ts
import { useDataGridQuery, useDataGridList } from "@eristack/data-grid/react";

const q = useDataGridQuery({ schema });
const list = useDataGridList({
  schema,
  client,
  scope: ["orders"],
});
// list.items / list.pageInfo — server state from TanStack Query
// q.setSearch / q.setPage — local query builder state
```

## TanStack Router (URL state)

Keep list state in search params via `toSearch` / `fromSearch` (JSON nested `filters` / `sorts`):

```ts
import { toSearch, fromSearch, type DataGridSearch } from "@eristack/data-grid";

validateSearch: (search: Record<string, unknown>): DataGridSearch =>
  toSearch(fromSearch(search, schema)),
```

See [Getting started](./getting-started.md).
