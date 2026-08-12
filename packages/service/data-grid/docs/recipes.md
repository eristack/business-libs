---
title: Recipes
description: End-to-end patterns for real list screens
sidebar_position: 9
---

# Recipes

Practical compositions of schema, SQL, HTTP, and UI. Prefer these over inventing new shapes. Runnable references: `examples/express` + `examples/react`.

## Recipe: orders with relations and sums

**Problem.** List sales orders with customer fields and line totals — filterable by region, status, and `totalMinor`.

**Approach.**

1. Define a schema on the **flat list row** (includes `customerName`, `totalMinor`, …).
2. Build a Drizzle subquery: `orders ⋈ customers` + `SUM`/`COUNT` of lines.
3. `executeDrizzleList` for the page.
4. Expose `GET /orders` with Express middleware.
5. Drive the UI with `useDataGridList` + controller.

```ts
export async function listOrders(db: AppDb, query: DataGridQuery) {
  const source = orderGridSource(db);
  return executeDrizzleList({
    dialect: "sqlite",
    db,
    source,
    columns: columnsFromSource(source, orderGridSchema),
    query,
    schema: orderGridSchema,
    map: mapRow,
  });
}
```

Runnable: `examples/express` + `examples/react` (Orders panel after login).

## Recipe: Express route end-to-end

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

Client:

```ts
const client = createDataGridClient<OrderListRow>({
  baseUrl: () => apiBaseUrl,
  path: "/orders",
  schema: orderGridSchema,
  getHeaders: async () => {
    const token = await auth.ensureAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

## Recipe: Nest list controller

```ts
import { DataGridModule, ParseDataGridPipe } from "@eristack/data-grid/nest";

@Module({
  imports: [DataGridModule.forRoot({ schema: orderGridSchema })],
})
export class OrdersModule {}

@Get()
list(@Query(ParseDataGridPipe) query: DataGridQuery) {
  return this.orders.list(query); // returns DataGridResult
}
```

## Recipe: in-memory child collection

**Problem.** List refresh sessions for the current subject — dozens of rows, already loaded from the token store.

**Approach.** Do not hit SQL with data-grid. Load the collection, then `applyInMemory`.

```ts
const sessions = await store.listBySubject(subject);
const grid = createDataGrid(sessionDataGridSchema);
return grid.applyInMemory(sessions, query, (row, field) => row[field]);
```

This is what `@eristack/jwt-auth` `listSessions` does. Same `DataGridResult` envelope as SQL lists.

## Recipe: draft/commit filter modal + search

**Problem.** Checkbox groups / filter rows and a search input without refetch-on-type.

```ts
const controller = useDataGridController({ schema });
const list = useDataGridList({ schema, client, controller, scope: ["orders"] });

// Modal open
controller.syncDraftFromCommitted();
controller.addFilterRow({ field: "status", op: "in", value: "open,fulfilled" });

// Modal Apply
controller.commitFilters(); // page → 1, mode → advanced

// Search
controller.setDraftSearch(q);
controller.commitSearch(); // Enter / button / blur → mode → search

// Sort (immediate + page reset)
controller.sortBy("totalMinor", "desc");

// Clear
controller.resetFilters();
```

Keep money inputs in major units in the form; convert to minor units before commit.

## Recipe: search box vs advanced filters

**Problem.** One toolbar with a search input *or* facet filters — not both at once.

**Approach.** Toggle `mode`. Commit search **or** commit filters. Clear the inactive side when switching so the URL and server stay honest. See [Edge cases](./edge-cases.md#advanced-and-search-never-mix).

```ts
function onChooseSearch() {
  controller.setDraftSearch(searchText);
  controller.commitSearch();
}

function onApplyFacets() {
  controller.commitFilters();
}
```

## Recipe: TanStack Router + Query

**Problem.** Shareable URLs and cached fetches.

```ts
// route
validateSearch: (raw) => toSearch(fromSearch(raw, schema)),

// page
const search = Route.useSearch();
const query = fromSearch(search, schema);

const list = useQuery({
  queryKey: ["orders", grid.serializeString(query)],
  queryFn: () => client.list(query),
});

// on committed filter change
navigate({ search: toSearch(nextQuery) });
```

Alternatively use `useDataGridList` for local query state when the URL is not the source of truth yet — then graduate to Router when the screen stabilizes. Do not put draft keystrokes in the URL.

## Recipe: empty page after filter tighten

**Problem.** User is on page 3; applying a filter drops `total` to 5 rows → empty page.

**Approach.** Always reset page on filter/search/sort commit (controller default). If you build a custom controller, call `setPage(1)` yourself. Empty-state UI: if `total === 0` show “no matches”; if `page > totalPages` navigate to page 1.

## Recipe: detail drawer beside the grid

**Problem.** Click a row, load lines / children.

**Approach.** Grid stays on `DataGridResult`. Detail is a separate `GET /orders/:id` that reuses the same projection for the header and joins children for the body. Do not overload the list endpoint with nested graphs — list rows stay flat and cheap.

## Recipe: saved views

**Problem.** Store “Open EU orders over $500” as a named view.

**Approach.** Persist a `DataGridQuery` (or `toSearch` object) as JSON. On load, `parse` against the current schema — invalid fields fail closed so renamed columns do not silently no-op. Re-run through `fromSearch` / `toSearch` before writing URLs.

## Recipe: package-owned list (library authors)

If you ship an `@eristack/*` package that lists something:

1. Define a schema next to the domain (`sessionDataGridSchema`, …).
2. Accept `DataGridQueryInput` on the list method.
3. Return `DataGridResult<T>` — never a bare array.
4. Document the schema fields in package docs.
5. Reuse `/rest` + Express/Nest adapters the same way jwt-auth and doc-number do.

Consumers then wire one React hook pattern for every list in the product.

## Recipe: server-only advanced filters (no React controller)

```ts
const grid = createDataGrid(orderGridSchema);
const query = grid.parse({
  mode: "advanced",
  filters: {
    type: "group",
    logic: "and",
    children: [
      { type: "clause", field: "status", op: "eq", value: "open" },
      { type: "clause", field: "totalMinor", op: "gte", value: 50_000 },
    ],
  },
  page: 1,
  pageSize: 20,
});
return listOrders(db, query);
```
