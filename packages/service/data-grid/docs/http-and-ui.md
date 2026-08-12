---
title: HTTP & UI adapters
description: REST, Express, Nest, HTTP client, and TanStack React hooks
sidebar_position: 7
---

# HTTP & UI adapters

All adapters are **headless**. They parse queries, shape JSON, and call your loader — they never open a database, pick a CSS library, or own a `QueryClient`.

## Layering

```text
@eristack/data-grid                 core
        │
        ├── /drizzle                SQL helpers + executeDrizzleList
        ├── /rest                   framework-free HTTP helpers
        │     ├── /express
        │     └── /nest
        └── /client                 framework-agnostic fetch wrapper
              └── /react            TanStack Query over /client
```

`/react` talks only to `/client` (or an injected `queryFn`). It never calls `fetch` itself.

## REST (framework-free)

```ts
import {
  createDataGridListAction,
  parseDataGridFromRequest,
  toDataGridBody,
  toDataGridErrorResponse,
} from "@eristack/data-grid/rest";

const listOrders = createDataGridListAction({
  schema: orderGridSchema,
  load: async (query, req) => {
    // authorize from req.headers, then:
    return executeDrizzleList({ /* … */ query, schema: orderGridSchema });
  },
});

// In your server of choice:
const response = await listOrders(restRequest);
// { status, body: { items, pageInfo, query } | { error } }
```

`toDataGridBody(result)` is the success envelope. Errors from parse become `400` with `{ error: { code, message } }`.

## Express

```ts
import {
  createDataGridMiddleware,
  toDataGridBody,
  toDataGridErrorResponse,
  applyRestResponse,
} from "@eristack/data-grid/express";

const parseGrid = createDataGridMiddleware(orderGridSchema);

app.get("/orders", requireAuth, parseGrid, async (req, res) => {
  try {
    const result = await listOrders(db, req.dataGridQuery!);
    res.json(toDataGridBody(result));
  } catch (error) {
    applyRestResponse(res, toDataGridErrorResponse(error));
  }
});
```

Middleware attaches `req.dataGridQuery`. Invalid queries short-circuit with `400`.

## NestJS

```ts
import { DataGridModule, ParseDataGridPipe, DATA_GRID_SCHEMA } from "@eristack/data-grid/nest";

@Module({
  imports: [
    DataGridModule.forRoot({ schema: orderGridSchema }),
  ],
})
export class OrdersModule {}

@Get()
list(@Query(ParseDataGridPipe) query: DataGridQuery) {
  return this.orders.list(query);
}
```

Register the schema once; the pipe parses and validates per request.

## HTTP client

```ts
import { createDataGridClient } from "@eristack/data-grid/client";

const client = createDataGridClient<OrderListRow>({
  baseUrl: () => apiBaseUrl,
  path: "/orders",
  schema: orderGridSchema,
  credentials: "same-origin",
  getHeaders: async () => {
    const token = await auth.ensureAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const page = await client.list({
  mode: "search",
  q: "acme",
  page: 1,
  pageSize: 20,
});
```

The client serializes with the same JSON search params the server parses. Vue, Svelte, or plain TS can wrap this — React is optional.

## React (TanStack Query)

Require an app-owned `QueryClientProvider`.

### Local query state only

```ts
import { useDataGridQuery } from "@eristack/data-grid/react";

const grid = useDataGridQuery({ schema: orderGridSchema });
// grid.query / setFilters / setSearch / setPage / queryString
```

### List + cache

```ts
import { useDataGridList } from "@eristack/data-grid/react";

const list = useDataGridList({
  schema: orderGridSchema,
  client,
  scope: ["orders"], // query key segment
  enabled: status === "authenticated",
});

list.items;
list.pageInfo;
list.isFetching;
list.setPage(2);
list.setFilters(nextFilters);
list.refetch();
```

`scope` namespaces the TanStack Query key (`["eristack","data-grid", …scope, queryString]`).

You may pass `queryFn` instead of `client` when the loader is not HTTP (e.g. tRPC).

## Response contract

Success:

```json
{
  "items": [ /* … */ ],
  "pageInfo": {
    "mode": "offset",
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "query": { /* normalized DataGridQuery */ }
}
```

Error:

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Field \"secret\" is not filterable"
  }
}
```

Keep this envelope stable across packages so frontends and agents only learn it once.
