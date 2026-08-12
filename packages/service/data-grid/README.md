# @eristack/data-grid

Schema-aware list queries for Eristack services and capabilities: multi-field filters, separate search mode, multi-sort, offset/cursor pagination.

## Install

```bash
pnpm add @eristack/data-grid
```

## Documentation

Package docs are the source of truth (also rendered on the site):

| Guide | Topic |
| --- | --- |
| [Introduction](./docs/index.md) | Why a shared list contract |
| [Getting started](./docs/getting-started.md) | Schema → parse → result |
| [Concepts](./docs/concepts.md) | Schema, query, result, modes |
| [Querying](./docs/querying.md) | Operators, search, sort, pagination |
| [URL & TanStack Router](./docs/url-search.md) | JSON search params |
| [Database (Drizzle)](./docs/database.md) | Projections, `executeDrizzleList` |
| [HTTP & UI](./docs/http-and-ui.md) | Express, Nest, client, React |
| [Recipes](./docs/recipes.md) | Orders with sums, facets, Router |

## Quick taste

```ts
import { createDataGrid } from "@eristack/data-grid";
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";

const grid = createDataGrid(schema);
const query = grid.parse(req.query);

// Small collections:
const memory = grid.applyInMemory(rows, query);

// SQL — app owns joins/aggregates; library runs filter/sort/count/page:
const source = orderGridSource(db);
const sql = await executeDrizzleList({
  dialect: "sqlite",
  db,
  source,
  columns: columnsFromSource(source, schema),
  query,
  schema,
  map: mapRow,
});
```

**Modes:** `advanced` (JSON `filters`) and `search` (`q`) are separate — they never mix.

**URL:** nested `filters` / `sorts` are JSON (TanStack Router–aligned). Use `toSearch` / `fromSearch`.

## Adapters

| Import | Role |
| --- | --- |
| `@eristack/data-grid/drizzle` | `executeDrizzleList` / `columnsFromSource` / `buildDrizzleQuery` |
| `@eristack/data-grid/rest` | Parse + `{ items, pageInfo, query }` body |
| `@eristack/data-grid/express` | Middleware + helpers |
| `@eristack/data-grid/nest` | Module + pipe |
| `@eristack/data-grid/client` | Framework-agnostic HTTP |
| `@eristack/data-grid/react` | TanStack Query hooks over `/client` |

All adapters are headless — no UI kit.

## Examples

`examples/express` + `examples/react` ship an orders domain with customers, line items, `SUM`/`COUNT`, and a React grid.

## Consumers

`@eristack/jwt-auth` sessions and `@eristack/doc-number` formats list through the same `DataGridResult` contract.
