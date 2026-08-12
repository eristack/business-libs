---
title: Recipes
description: End-to-end patterns for real list screens
sidebar_position: 8
---

# Recipes

Practical compositions of schema, SQL, HTTP, and UI. Prefer these over inventing new shapes.

## Recipe: orders with relations and sums

**Problem.** List sales orders with customer fields and line totals — filterable by region, status, and `totalMinor`.

**Approach.**

1. Define a schema on the **flat list row** (includes `customerName`, `totalMinor`, …).
2. Build a Drizzle subquery: `orders ⋈ customers` + `SUM`/`COUNT` of lines.
3. `executeDrizzleList` for the page.
4. Expose `GET /orders` with Express middleware.
5. Drive the UI with `useDataGridList`.

Skeleton:

```ts
// schema + source + map — see examples/express/src/orders

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

## Recipe: in-memory child collection

**Problem.** List refresh sessions for the current subject — dozens of rows, already loaded from the token store.

**Approach.** Do not hit SQL with data-grid. Load the collection, then `applyInMemory`.

```ts
const sessions = await store.listBySubject(subject);
const grid = createDataGrid(sessionDataGridSchema);
return grid.applyInMemory(sessions, query, (row, field) => row[field]);
```

This is what `@eristack/jwt-auth` `listSessions` does. Same `DataGridResult` envelope as SQL lists.

## Recipe: faceted filters in React

**Problem.** Checkbox groups for `status` / `region`, a minimum total, and a sort select.

**Approach.** Build a `FilterNode` in the UI; call `list.setFilters` / `list.setSorts` / `list.setPage(1)`.

```ts
function buildFilters(input: {
  statuses: string[];
  regions: string[];
  minTotalMinor: number | null;
}): FilterNode | undefined {
  const children: FilterNode[] = [];
  if (input.statuses.length) {
    children.push({
      type: "clause",
      field: "status",
      op: "in",
      value: input.statuses,
    });
  }
  if (input.regions.length) {
    children.push({
      type: "clause",
      field: "customerRegion",
      op: "in",
      value: input.regions,
    });
  }
  if (input.minTotalMinor != null) {
    children.push({
      type: "clause",
      field: "totalMinor",
      op: "gte",
      value: input.minTotalMinor,
    });
  }
  if (children.length === 0) return undefined;
  if (children.length === 1) return children[0];
  return { type: "group", logic: "and", children };
}

// on Apply:
list.setMode("advanced");
list.setFilters(buildFilters({ statuses, regions, minTotalMinor }));
list.setSorts([{ field: sortField, dir: sortDir }]);
list.setPage(1);
```

Keep money inputs in major units in the form; convert to minor units before building the clause (`Math.round(dollars * 100)`).

## Recipe: search box vs advanced filters

**Problem.** One toolbar with a search input *or* facet filters — not both at once.

**Approach.** Toggle `mode`. Search calls `list.setSearch(q)`; facets call `list.setFilters(…)`. Clear the inactive side when switching so the URL and server stay honest.

```ts
function onModeChange(mode: "advanced" | "search") {
  if (mode === "search") {
    list.setSearch(searchText);
  } else {
    list.setFilters(buildFilters(/* … */));
  }
  list.setPage(1);
}
```

## Recipe: TanStack Router + Query

**Problem.** Shareable URLs and cached fetches.

**Approach.**

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

// on filter change
navigate({ search: toSearch(nextQuery) });
```

Alternatively use `useDataGridList` for local query state when the URL is not the source of truth yet — then graduate to Router when the screen stabilizes.

## Recipe: detail drawer beside the grid

**Problem.** Click a row, load lines / children.

**Approach.** Grid stays on `DataGridResult`. Detail is a separate `GET /orders/:id` that reuses the same projection for the header and joins children for the body. Do not overload the list endpoint with nested graphs — list rows stay flat and cheap.

## Recipe: package-owned list (library authors)

If you ship an `@eristack/*` package that lists something:

1. Define a schema next to the domain (`sessionDataGridSchema`, …).
2. Accept `DataGridQueryInput` on the list method.
3. Return `DataGridResult<T>` — never a bare array.
4. Document the schema fields in package docs.
5. Reuse `/rest` + Express/Nest adapters the same way jwt-auth and doc-number do.

Consumers then wire one React hook pattern for every list in the product.
