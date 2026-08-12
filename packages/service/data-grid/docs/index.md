---
title: Introduction
description: Schema-aware list queries for filters, search, sort, and pagination
sidebar_position: 1
---

# @eristack/data-grid

Almost every business screen is a list: orders, sessions, formats, invoices. Those lists need the same four capabilities — **filter**, **search**, **sort**, and **paginate** — whether the data lives in memory or in SQL, and whether the UI is a React table or a plain `curl`.

`@eristack/data-grid` is the shared contract for that problem. You declare which fields exist and how they may be queried. The library parses URL state, validates it against your schema, and either applies it in memory or pushes it into Drizzle. HTTP and React adapters stay headless: your app owns the database, the fetch client, and the UI kit.

## Why a shared contract?

Without one, each package invents its own query string (`?status=open&sort=-created`), its own response shape, and its own React hook. Frontend and backend drift. Agents and humans re-learn the same rules per endpoint.

With data-grid:

| Concern | Owned by |
| --- | --- |
| Which fields exist; which are filterable / searchable / sortable | Your **schema** |
| Normalized query + `{ items, pageInfo, query }` result | **Core** |
| Joins, aggregates, domain row mapping | Your **app** (projection) |
| Express / Nest / client / React wiring | **Adapters** (headless) |

## What you get

- **Two modes that never mix** — structured `advanced` filters, or free-text `search` (`q`)
- **A full operator set** — `eq`, `contains`, `in`, `between`, null/empty checks, and more
- **JSON search params** aligned with [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)
- **Offset or cursor** pagination with a uniform `pageInfo`
- **Drizzle execution** — `executeDrizzleList` runs count + page; you supply the `FROM` projection
- **Headless adapters** for REST, Express, Nest, HTTP client, and TanStack Query

## Mental model

```text
URL / Router search
        │
        ▼
   parse / fromSearch     ← schema validates fields & ops
        │
        ▼
   DataGridQuery          ← normalized { mode, filters|search, sorts, page }
        │
   ┌────┴────┐
   ▼         ▼
applyInMemory   executeDrizzleList(source, columns, …)
   │         │
   └────┬────┘
        ▼
 DataGridResult<T>        ← { items, pageInfo, query }
```

## Already used by the stack

- [`@eristack/jwt-auth`](/docs/jwt-auth) — `listSessions(subject, query?)`
- [`@eristack/doc-number`](/docs/doc-number) — `listFormats(entityKey, query?)`

Both return `DataGridResult`. Your domain lists should look the same.

## Next steps

- [Getting started](./getting-started.md) — install, schema, first list
- [Concepts](./concepts.md) — schema, query, result, modes
- [Querying](./querying.md) — filters, operators, sort, pagination
- [URL & TanStack Router](./url-search.md) — JSON search params
- [Database (Drizzle)](./database.md) — projections, joins, aggregates
- [HTTP & UI adapters](./http-and-ui.md) — Express, Nest, client, React
- [Recipes](./recipes.md) — end-to-end patterns
