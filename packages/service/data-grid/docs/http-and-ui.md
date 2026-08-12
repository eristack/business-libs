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

## React (TanStack Query + headless controller)

Require an app-owned `QueryClientProvider`.

### Draft / commit lifecycle

Typing in a search box or editing filter rows must **not** refetch. Only a commit event updates the committed query (the fetch key):

| Action | Fetch? | Pagination |
| --- | --- | --- |
| `setDraftSearch` / `updateFilterRow` / `addFilterRow` | No | — |
| `commitSearch` / `commitFilters` / `commit` / `commitSorts` | Yes | Reset to page 1 (offset) / clear cursor |
| `resetFilters` / `resetAll` | Yes | Reset |
| `sortBy` | Yes | Reset |
| `setPage` / `setPageSize` / `setCursor` | Yes | As set (`setPageSize` → page 1) |

### Filter modal (headless rows)

```ts
import {
  useDataGridController,
  useDataGridList,
  VALUELESS_OPS,
} from "@eristack/data-grid/react";

const controller = useDataGridController({ schema });
const list = useDataGridList({ schema, client, controller, scope: ["orders"] });

// Open modal: copy committed → draft
controller.syncDraftFromCommitted();

controller.addFilterRow();
controller.updateFilterRow(id, { field: "status", op: "eq", value: "open" });
controller.removeFilterRow(id);

// Apply / close modal
controller.commitFilters(); // FilterNode + mode=advanced + page=1

// Search box
controller.setDraftSearch(text); // no fetch
controller.commitSearch();       // blur / Enter / Search button
```

Each draft row is `{ id, field, op, value }`. Incomplete rows are skipped on commit. `opsForField(name)` returns suggested operators for the field type.

### List hook

```ts
const list = useDataGridList({
  schema,
  client,
  controller, // recommended
  scope: ["orders"],
});
// list.items / list.pageInfo — TanStack Query
// list.query — committed only
// list.draftSearch / list.filterRows — draft surface
```

App owns modal/chrome markup — the library is headless. See `examples/react` and [Recipes](./recipes.md).

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
