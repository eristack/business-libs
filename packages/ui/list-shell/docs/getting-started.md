---
title: Getting started
description: A complete list route — data-grid client + useDataGridList, ListPageLayout/ListToolbar/QueryStateBanner, sort and page controls, TanStack Router search sync, and minimal CSS.
---

# Getting started

Compose with `@eristack/data-grid/react` — this package does not parse filters or fetch rows. Stack: `@eristack/ai-knowledge#ui-package-stack`.

## Install

```bash
pnpm add @eristack/list-shell @eristack/design-system @eristack/data-grid @tanstack/react-query react
```

Peers: `design-system@^0.1.0`, `data-grid@^0.2.0`, `@tanstack/react-query@^5`.

## 1. Schema + client (shared with the server)

```ts
// partners.grid.ts — same schema object the API validates with
import type { DataGridSchema } from "@eristack/data-grid";
import { createDataGridClient } from "@eristack/data-grid/client";

export const partnerSchema: DataGridSchema = {
  fields: [
    { name: "name", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "country", type: "enum", enumValues: ["SG", "MY", "ID"], filterable: true },
    { name: "creditLimit", type: "money", filterable: true, sortable: true },
    { name: "createdAt", type: "wall", timezone: "Asia/Singapore", sortable: true },
  ],
  defaultSorts: [{ field: "name", dir: "asc" }],
  defaultPageSize: 25,
};

export const partnerClient = createDataGridClient<Partner>({ schema: partnerSchema, baseUrl: "/api", path: "/partners" });
```

## 2. The page

```tsx
import { useDataGridList } from "@eristack/data-grid/react";
import { fromSearch, toSearch } from "@eristack/data-grid";
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";
import { FilterChipBar } from "@eristack/filter-builder";

function PartnersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = useDataGridList<Partner>({
    schema: partnerSchema,
    client: partnerClient,
    initialQuery: fromSearch(search, partnerSchema),
  });

  useEffect(() => {
    navigate({ search: toSearch(list.query), replace: true });
  }, [list.queryString]);

  return (
    <ListPageLayout
      toolbar={
        <ListToolbar
          leading={<h1 className="text-lg font-semibold">Partners</h1>}
          trailing={
            <>
              <select value={list.query.sorts[0]?.field} onChange={(e) => list.sortBy(e.target.value)}>
                {list.sortFields.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
              </select>
              <button type="button">New partner</button>
            </>
          }
        >
          <input
            placeholder="Search…"
            value={list.draftSearch}
            onChange={(e) => list.setDraftSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && list.commitSearch()}
          />
        </ListToolbar>
      }
      banner={
        <QueryStateBanner
          isLoading={list.isLoading}
          isError={list.isError}
          isEmpty={!list.isLoading && list.items.length === 0}
          errorMessage={list.error?.message}
          emptyMessage={<>No partners yet. <button type="button">Create one</button></>}
        />
      }
    >
      <FilterChipBar>{/* chips from list.filterRows — see @eristack/filter-builder */}</FilterChipBar>
      <PartnersTable rows={list.items} />
      {list.pageInfo?.mode === "offset" ? (
        <Pager page={list.pageInfo.page} pageSize={list.pageInfo.pageSize} total={list.pageInfo.total} onPage={list.setPage} />
      ) : null}
    </ListPageLayout>
  );
}
```

`ListToolbar` children render **between** leading and trailing — the natural place for the search box.

## 3. Server side (once)

Express: `createDataGridListAction` / `executeDrizzleList` from `@eristack/data-grid` with the **same** `partnerSchema`. Nest: `DataGridModule` + `ParseDataGridPipe`. See `@eristack/data-grid#data-grid-adapters`.

## Minimal CSS (you own it)

```css
.erista-list-page { display: flex; flex-direction: column; gap: var(--erista-density-gap-comfortable); }
.erista-list-toolbar { display: flex; align-items: center; gap: var(--erista-density-gap-comfortable); }
.erista-list-toolbar__trailing { margin-left: auto; display: flex; gap: var(--erista-density-gap-compact); }
.erista-query-banner[data-state="error"] { color: hsl(var(--erista-color-destructive)); }
.erista-query-banner[data-state="empty"] { color: hsl(var(--erista-color-muted-foreground)); }
```

## Production path

1. Express/Nest list route with `createDataGridListAction` or Drizzle `executeDrizzleList` — same schema object as the client.
2. Router search params ↔ `fromSearch` / `toSearch` (committed query only).
3. Optional `@eristack/filter-builder` above the table.
4. Export via `@eristack/spreadsheet-render` in the app — not in list-shell.
5. Gate "New" and row actions with `@eristack/policy-ui`.

## Gotchas

- `QueryStateBanner` precedence is loading → error → empty; pass `isEmpty` only when not loading or the empty message flashes on first render.
- `isEmpty` is not derived for you — compute from `list.items.length`.
- The banner is a sibling of the body, so the table still renders (e.g. stale rows during refetch). Hide the table yourself if you want a pure empty state.
- `ListToolbar` renders its `children` without a wrapper element; wrap them if you need layout.
- No pagination component ships — `list.pageInfo` + `list.setPage` / `setCursor` is all you need for one.

## Exports

`ListPageLayout`, `ListToolbar`, `QueryStateBanner` + their `*Props` types.
