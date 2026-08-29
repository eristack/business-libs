---
title: "@eristack/opinion"
description: Opinionated ERP REST route map on @eristack/rest
sidebar_position: 1
---

# @eristack/opinion

`@eristack/opinion` defines the **canonical ERP HTTP shape** for documents and masters: options metadata, data-grid lists, CRUD, and status transitions via **`PATCH /:id/:action`**. Apps own handlers and persistence; opinion owns the boring route table so every `@eristack/*` adapter lines up.

## When to use it

Use this package when you need:

- A predictable REST map across invoices, orders, journals, and masters
- Declarative routes on `@eristack/rest` with optional Express/Nest mount helpers
- OpenAPI fragments for document resources (`documentRoutesOpenApiDocument`)
- Transition endpoints that match `@eristack/doc-transitions` action names

## Design highlights

- **Handlers in the app** — library exports route defs, not business logic
- **Partial implementation** — omit roles you have not built yet (`createDocumentRoutes` skips missing handlers)
- **String-first JSON** — money, qty, dates use `@eristack/money`, `@eristack/uom`, `@eristack/timestamp`
- **Lists use data-grid** — list handler returns `{ items, pageInfo, query }`
- **OpenAPI composition** — merge with doc-number, pbac, and app routes via `@eristack/rest`

## Subpaths

```text
@eristack/opinion                    core — createDocumentRoutes, createOpinionRouter
        ├── /express                 mountOpinionRouter
        ├── /nest                    OpinionModule.mount
        └── /openapi                 documentRoutesOpenApiDocument
```

## Next steps

- [Getting started](./getting-started.md) — Express mount, first list + transition handler
- [Concepts](./concepts.md) — roles, base paths, handler contracts
- [Route map](./route-map.md) — full method/path table and param rules
- [Express & Nest adapters](./adapters-express-nest.md) — mount patterns
- [OpenAPI compose](./openapi-compose.md) — merge specs with other packages
- [Errors & epoch](./errors-and-epoch.md) — version conflicts, cache policy headers
- [Gotchas](./gotchas.md) — PUT vs PATCH, partial routers, policy order
- [Recipes](./recipes.md) — invoice API, composed OpenAPI, Backseat prototype
- [API reference](./api-reference.md) — exports cheat-sheet
