# @eristack/data-grid

Dynamic list queries for Eristack services and capabilities: multi-field filters, separate search mode, multi-sort, offset/cursor pagination.

## Install

```bash
pnpm add @eristack/data-grid
```

## Core

```ts
import { createDataGrid } from "@eristack/data-grid";

const grid = createDataGrid({
  fields: [
    { name: "name", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "age", type: "number", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "name", dir: "asc" }],
  defaultPageSize: 20,
});

const result = grid.applyInMemory(rows, "mode=search&q=ada&page=1&pageSize=10");
// result.items / result.pageInfo / result.query
```

**Modes (separate):**

- `advanced` — structured `filters` JSON (`FilterNode`)
- `search` — `q` OR-contains across `searchable` fields (ignores advanced filters)

**URL / TanStack Router:** nested `filters` and `sorts` are JSON (objects in Router search; JSON strings on the wire). Use `toSearch` / `fromSearch` / `serializeSearch` with Router `validateSearch`.

**Ops:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`, `notIn`, `between`, `notBetween`, `isNull`, `isNotNull`, `isEmpty`, `isNotEmpty`

## Adapters

| Import | Role |
| --- | --- |
| `@eristack/data-grid/drizzle` | `executeDrizzleList` / `columnsFromSource` / `buildDrizzleQuery` |
| `@eristack/data-grid/rest` | Parse from RestRequest, `{ items, pageInfo, query }` body |
| `@eristack/data-grid/express` | Middleware + parse helpers |
| `@eristack/data-grid/nest` | `DataGridModule` + `ParseDataGridPipe` |
| `@eristack/data-grid/client` | Framework-agnostic HTTP (`createDataGridClient`) |
| `@eristack/data-grid/react` | TanStack Query hooks wrapping `/client` |


All adapters are headless — no UI kit.

## Consumers

`@eristack/jwt-auth` sessions and `@eristack/doc-number` formats list through this contract.
