---
title: Overview
description: Dynamic filter, search, sort, and pagination queries
sidebar_position: 1
---

# @eristack/data-grid

Schema-aware list queries for Eristack **service** and **capability** packages.

## What it solves

One shared contract for:

- Multi-field **advanced** filters (complete operator set)
- Separate **search** mode (`q` → OR `contains` across searchable fields)
- Multi-field sorting
- **Offset** or **cursor** pagination
- Parse / serialize to URL query strings (JSON nested params, TanStack Router–aligned)

Core is pure TypeScript. Adapters are headless (Drizzle SQL helpers, REST/Express/Nest, client, React hooks).

## Modes

| Mode | Behavior |
| --- | --- |
| `advanced` | Uses JSON `filters` — ignores `q` |
| `search` | Uses `q` across searchable fields — ignores structured filters |

## Quick start

```ts
import { createDataGrid } from "@eristack/data-grid";

const grid = createDataGrid({
  fields: [
    { name: "name", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "age", type: "number", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "name", dir: "asc" }],
});

const page = grid.applyInMemory(rows, "mode=search&q=ada&page=1&pageSize=20");
```

## Consumers

- `@eristack/jwt-auth` — `listSessions(subject, query?)` → `DataGridResult`
- `@eristack/doc-number` — `listFormats(entityKey, query?)` → `DataGridResult`

List HTTP bodies use `{ items, pageInfo, query }`.
