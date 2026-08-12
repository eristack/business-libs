---
title: URL & TanStack Router
description: JSON search params, serialize helpers, and validateSearch
sidebar_position: 5
---

# URL & TanStack Router

List state belongs in the URL. Shareable links, back/forward, and SSR all depend on it. `@eristack/data-grid` follows the same convention TanStack Router recommends: **flat search keys**, with nested values as JSON structures.

## Wire format

| Key | Type | Purpose |
| --- | --- | --- |
| `mode` | `"advanced"` \| `"search"` | Query mode |
| `q` | string | Free-text (`search` mode) |
| `filters` | JSON `FilterNode` | Structured filters (`advanced`) |
| `sorts` | JSON `SortClause[]` | Multi-sort |
| `pageMode` | `"offset"` \| `"cursor"` | Pagination strategy |
| `page` / `pageSize` | number | Offset paging |
| `cursor` / `limit` | string / number | Cursor paging |

### HTTP (`URLSearchParams`)

Nested values are **JSON strings**:

```
?mode=advanced
&filters={"type":"clause","field":"status","op":"eq","value":"open"}
&sorts=[{"field":"orderedAt","dir":"desc"}]
&page=1
&pageSize=20
```

`serializeQuery` / `serializeQueryString` produce this form. `parse` accepts it back.

### TanStack Router

Router keeps nested values as **objects/arrays** in the search object. Use `toSearch` / `fromSearch` (or `grid.serializeSearch`) so you never hand-roll `JSON.stringify` in route code.

```ts
import {
  fromSearch,
  toSearch,
  type DataGridSearch,
} from "@eristack/data-grid";

export const Route = createFileRoute("/orders")({
  validateSearch: (raw: Record<string, unknown>): DataGridSearch =>
    toSearch(fromSearch(raw, orderGridSchema)),
});
```

`fromSearch` normalizes and validates. `toSearch` re-emits a clean, minimal search object (handy after defaults fill in).

In the component:

```ts
function OrdersPage() {
  const search = Route.useSearch();
  const query = fromSearch(search, orderGridSchema);
  const navigate = Route.useNavigate();

  function goToPage(page: number) {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  }

  function applyQuery(next: DataGridQuery) {
    navigate({ search: toSearch(next) });
  }
}
```

## Helper cheat sheet

| Helper | Input | Output |
| --- | --- | --- |
| `parseQuery` / `grid.parse` | string \| params \| object | `DataGridQuery` |
| `fromSearch` | `DataGridSearch` \| record | `DataGridQuery` |
| `toSearch` | `DataGridQuery` | `DataGridSearch` |
| `serializeQuery` | `DataGridQuery` | `URLSearchParams` |
| `serializeQueryString` | `DataGridQuery` | query string |
| `serializeSearchRecord` / `grid.serializeSearch` | `DataGridQuery` | object for `navigate({ search })` |

## Zod (optional)

Router apps often wrap validation with Zod. You can validate the *shape* with Zod and still normalize with data-grid:

```ts
import { z } from "zod";

const rawSearch = z
  .object({
    mode: z.enum(["advanced", "search"]).optional(),
    q: z.string().optional(),
    filters: z.unknown().optional(),
    sorts: z.unknown().optional(),
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional(),
  })
  .passthrough();

validateSearch: (search) =>
  toSearch(fromSearch(rawSearch.parse(search), orderGridSchema)),
```

Field-level allow-listing still happens inside `fromSearch` / `parse` against your schema — Zod does not replace that.

## What we do not support

Compact DSLs such as `f=status:eq:open` or `sort=-createdAt` are **not** part of the contract. They look shorter but fight Router’s JSON search model and every OpenAPI/codegen path. Prefer explicit JSON.

## Pairing with TanStack Query

URL holds the intent; Query holds the server cache:

1. `validateSearch` → `DataGridSearch`
2. `fromSearch` → `DataGridQuery`
3. `useDataGridList` / `client.list(query)` → `DataGridResult`

See [HTTP & UI](./http-and-ui.md) and [Recipes](./recipes.md).
