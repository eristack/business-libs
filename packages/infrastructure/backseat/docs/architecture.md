---
title: Architecture
description: Store, router, and controller responsibilities
---

# Architecture

Backseat mirrors backend layering — but you own the controllers. Nothing is generated beyond optional CRUD shortcuts.

## Layer diagram

```text
┌─────────────────────────────────────────────────────────┐
│  React UI + TanStack Query                              │
│    queryFn → handlers | invoke | handle | fetch       │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  createBackseat (engine)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Router      │  │ Controllers  │  │ Action registry │ │
│  │ method+path │→ │ registerRoute│  │ registerAction  │ │
│  └─────────────┘  └──────┬───────┘  └────────┬────────┘ │
│                          │                    │         │
│                          └────────┬───────────┘         │
│                                   ▼                     │
│                          ┌─────────────────┐            │
│                          │ BackseatStore   │            │
│                          │ list/get/create │            │
│                          └────────┬────────┘            │
└───────────────────────────────────┼───────────────────────┘
                                    ▼
                          ┌─────────────────┐
                          │ Memory | IDB    │
                          └─────────────────┘
```

## Request paths

Three ways the same logic can run:

```text
1. Direct (preferred for Query)
   api.handlers.products.list()
   api.invoke("reports.summary", input)

2. REST-shaped
   api.handle({ method: "GET", path: "/api/products", query: {...} })

3. Fetch-compatible
   api.fetch("/api/products?status=approved")
```

CRUD collections wire path **1** and **2** together automatically. Custom controllers choose whichever entry fits.

## Store layer

The store is a **port** — swap implementations without touching routes.

| Implementation | Where | Persistence |
| --- | --- | --- |
| `createMemoryBackseatStore()` | Vitest, Storybook | Process memory |
| `createIndexedDbBackseatStore()` | Browser app | IndexedDB per `dbName` |

Documents are schemaless JSON with a required `id` (configurable via `idField` on collections).

**Snapshots** round-trip the entire store:

```ts
const snap = await api.snapshot();
await api.seed(snap);   // replace contents
await api.reset();      // clear
await api.reseed();     // clear + default seed
```

Collections appear when first document is created or when imported from snapshot.

## Router layer

Routes registered with:

```ts
{ method, path, handler, name?, collection? }
```

Matching rules:

1. HTTP method must match
2. Literal segments must match exactly
3. `:param` captures one segment
4. Trailing `/*` captures remainder as `_splat`
5. More specific routes win over splat routes

Path matching runs **after** stripping `baseUrl` from the request path.

## Controller layer

### CRUD factories

`registerCollection` uses `createCrudRouteHandlers` internally:

- Wires store CRUD to HTTP responses (200/201/204/404)
- Exposes parallel direct handlers on `api.handlers`
- Applies `parseListFilter` on list routes for query params

### Custom controllers

`registerRoute` handlers receive enriched context:

```ts
{
  req, params, store, backseat,
  query(name), queryAll(name), json<T>()
}
```

Use `backseat` to chain actions, re-read other collections, or call `snapshot()` mid-request (rare).

### Named actions

Bypass the router entirely. Registry keyed by string (`"procurement.approveBatch"`). Best for:

- Multi-argument Query functions
- Aggregations returning computed DTOs
- Internal APIs shared across features without HTTP naming debates

## React integration

`BackseatProvider` holds the engine singleton. Hooks resolve `handlers[collection]` and throw if collection was not registered.

Query keys live under `["backseat", collection, ...]` — invalidate explicitly when using raw handlers; hooks invalidate list/detail keys on mutations.

## Devtools layer

`<BackseatDevtools />` talks directly to `backseat.store` and engine methods (`reset`, `reseed`, `snapshot`). It does not go through HTTP — useful when routes are broken but data needs fixing.

## Design constraints

| Constraint | Rationale |
| --- | --- |
| No schema enforcement | Prototype speed — app validates in controllers |
| No auth middleware | Use app-level mock user; real auth is `@eristack/jwt-auth` |
| No migrations | Snapshots replace schema evolution during prototype |
| No server deploy | Browser-only engine |

## Comparison to monolithic fake servers

Libraries like RESTless combine DB + router + server in one class. Backseat splits:

- **Testability** — mock store without HTTP
- **Graduation** — swap store for Drizzle; keep controller source as spec
- **Query ergonomics** — handlers first, HTTP optional

## Related

- [Controllers](./controllers.md) — patterns and ERP examples
- [API reference](./api-reference.md) — complete method list
- [Graduation](./graduation.md) — prototype → production
