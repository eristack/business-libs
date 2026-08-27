---
title: API reference
description: createBackseat, store, handlers, routes, actions, and React hooks
---

# API reference

## `createBackseat(options)`

```ts
import { createBackseat } from "@eristack/backseat";
```

| Option | Default | Description |
| --- | --- | --- |
| `store` | *(required)* | `BackseatStore` implementation |
| `baseUrl` | `"/api"` | Prefix for `handle()` / `fetch()` |
| `collections` | — | Auto-register CRUD routes + `handlers` |
| `seed` | — | Snapshot or factory for `reseed()` / devtools |
| `idFactory` | `crypto.randomUUID()` | Used when `create()` body omits id |

Returns a `Backseat` instance.

### `Backseat` methods

| Method | Description |
| --- | --- |
| `registerCollection(name, options?)` | Add CRUD routes + return `CrudHandlers` |
| `registerRoute(route)` | Register custom HTTP controller |
| `registerAction(name, handler)` | Register named controller |
| `invoke(name, input)` | Call named action |
| `handle(req)` | Process REST request object |
| `fetch(url, init?)` | Fetch-compatible shim → `handle()` |
| `seed(snapshot)` | Import snapshot (merge replace via store) |
| `reseed()` | Clear + import `options.seed` |
| `snapshot()` | Export full store |
| `reset()` | Clear all collections |
| `routes()` | List registered route definitions (includes handlers) |
| `listRoutes()` | Serializable route metadata for Horizon B (`method`, `path`, `fullPath`, `name`) |
| `routesSnapshot()` | JSON inventory of routes + action names |
| `handlers` | Map of collection → `CrudHandlers` |
| `actions` | Map of action name → handler |
| `store` | Underlying `BackseatStore` |

---

## Store

### `createMemoryBackseatStore()`

```ts
import { createMemoryBackseatStore } from "@eristack/backseat";
```

In-process Map storage. **Tests and Storybook only** — not the browser app default.

### `createIndexedDbBackseatStore(options?)`

```ts
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
```

| Option | Default | Description |
| --- | --- | --- |
| `dbName` | `"eristack-backseat"` | IndexedDB database name |

**Browser prototype default.** Throws if `indexedDB` is unavailable (Node).

### `BackseatStore` interface

| Method | Description |
| --- | --- |
| `list(collection, filter?)` | List documents with optional filter |
| `get(collection, id)` | Get by id or `null` |
| `create(collection, doc)` | Insert — requires `doc.id` |
| `update(collection, id, patch)` | Shallow merge patch |
| `delete(collection, id)` | Remove document |
| `atomic(work)` | Multi-collection transaction — rolls back all touched collections when `work` throws |
| `listCollections()` | Collection names |
| `exportSnapshot()` | `{ [collection]: documents[] }` |
| `importSnapshot(snapshot)` | Replace store contents |
| `clear()` | Delete all data |

### `store.atomic(work)` — multi-collection writes

Use when one business action touches more than one collection (job + cost sheet, invoice + lines). All mutations inside `work` commit together; a thrown error rolls back every collection touched in that call.

```ts
await api.store.atomic(async (tx) => {
  await tx.set("jobs", { id: jobId, number: "JO/2026/00001", status: "draft" });
  await tx.set("costSheets", {
    id: costSheetId,
    jobId,
    status: "draft",
    lines: [],
  });
});

// Epoch bumps run after atomic — separate store / HTTP call
await epoch.bumpMany(["jobs", "cost-sheets", "dashboard"]);
```

`TransactionalStore` mirrors create/update/delete/get plus `set` (upsert by `doc.id`).

IndexedDB commits all dirty collections in **one** IDB transaction. Do not `await` non-store I/O inside `work` if you rely on IDB auto-commit semantics — finish store writes first, then bump epochs or call external APIs.

### `BackseatCollectionFilter`

| Field | Description |
| --- | --- |
| `where` | Equality match — `{ status: "approved" }` |
| `sort` | Field name to sort by |
| `order` | `"asc"` or `"desc"` |
| `offset` | Skip N rows after filter/sort |
| `limit` | Max rows returned |

### REST list query params

When using `handle()` / `fetch()` on CRUD list routes:

| Param | Maps to |
| --- | --- |
| `field=value` | `where.field` |
| `_sort=name` | `sort` |
| `_order=desc` | `order` |
| `_limit=10` | `limit` |
| `_offset=20` | `offset` |
| `_page=2` | page with `_limit` (default page size 10) |

---

## CRUD handlers

Each registered collection exposes:

```ts
api.handlers.products.list(filter?)
api.handlers.products.get(id)
api.handlers.products.create(body)
api.handlers.products.patch(id, body)
api.handlers.products.replace(id, body)
api.handlers.products.delete(id)
```

Errors throw typed exceptions:

| Error | HTTP | When |
| --- | --- | --- |
| `BackseatNotFoundError` | 404 | Missing document |
| `BackseatValidationError` | 400 | Invalid input |
| `BackseatConflictError` | 409 | Duplicate id |
| `BackseatVersionConflictError` | 409 | Optimistic `version` mismatch |

Use `jsonError()` / `versionConflict()` for the standard `{ error: { code, message, details? } }` envelope — same shape as Express/PBAC handlers:

```ts
import { jsonError, versionConflict, BackseatErrorCodes } from "@eristack/backseat";

return jsonError({ status: 403, code: BackseatErrorCodes.FORBIDDEN_SCOPE, message: "Out of scope" });
return versionConflict("Job was modified");
```

Custom routes should return `{ status, body }` directly for other codes.

---

## Routes

```ts
api.registerRoute({
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: "/path/:param/*",   // :params + trailing splat
  name: "optional-label",
  handler: async (ctx) => ({ status: 200, body: {} }),
});
```

### Route inventory (Horizon B)

```ts
const meta = api.listRoutes();
// [{ method: "POST", path: "/jobs", fullPath: "/api/jobs", name: "jobs.create" }, …]

const snapshot = api.routesSnapshot();
// { generatedAt, baseUrl, routes, actions } — paste into derive-backend sprint
```

BackseatDevtools **Routes** tab exports the same JSON. Handlers are not serializable — metadata only.

### Handler context (`ctx`)

| Property / method | Description |
| --- | --- |
| `req` | Full `BackseatRequest` |
| `params` | Path params — splat → `_splat` |
| `store` | `BackseatStore` |
| `backseat` | Full engine (invoke actions, nested calls) |
| `query(name)` | First query string value |
| `queryAll(name)` | All values for repeated keys |
| `json<T>()` | Parse `req.body` as JSON object |

### Path patterns

| Pattern | Example match |
| --- | --- |
| `/products` | `/products` |
| `/products/:id` | `/products/p1` → `{ id: "p1" }` |
| `/reports/*` | `/reports/inventory/summary` → `{ _splat: "inventory/summary" }` |

Specific routes match before splat routes.

---

## Actions

```ts
api.registerAction("namespace.actionName", async ({ input, store, backseat }) => {
  return result;
});

const result = await api.invoke("namespace.actionName", { foo: "bar" });
```

Use when:

- Query needs complex input objects awkward as URL/query
- Aggregation spans collections
- You want stable `queryKey` + `queryFn` without HTTP

---

## Seeds

```ts
import { createErpDemoSnapshot, erpDemoSnapshot } from "@eristack/backseat/seeds";
```

| Export | Description |
| --- | --- |
| `erpDemoSnapshot` | Static snapshot object |
| `createErpDemoSnapshot()` | Deep clone for mutation-safe seed |

Includes `partners`, `products`, `purchaseOrders` with realistic ERP-ish fields.

---

## React (`@eristack/backseat/react`)

### Provider

```tsx
<BackseatProvider backseat={api}>{children}</BackseatProvider>
```

### Hooks

| Hook | Description |
| --- | --- |
| `useBackseat()` | Access engine from context |
| `useBackseatList(collection, filter?, options?)` | Query list |
| `useBackseatGet(collection, id, options?)` | Query detail |
| `useBackseatCreate(collection, options?)` | Create mutation |
| `useBackseatPatch(collection, options?)` | Patch mutation `{ id, body }` |
| `useBackseatDelete(collection, options?)` | Delete mutation |

### Query keys

```ts
import { backseatListQueryKey, backseatDetailQueryKey } from "@eristack/backseat/react";

backseatListQueryKey("products", { where: { status: "active" } });
backseatDetailQueryKey("products", "p1");
```

Prefix: `["backseat", collection, ...]`.

### Devtools

```tsx
<BackseatDevtools
  seed={createErpDemoSnapshot}   // optional override
  defaultOpen={false}
  position="bottom-right"        // or "bottom-left"
/>
```

See [Devtools](./devtools.md).

---

## Low-level utilities

Exported from `@eristack/backseat`:

```ts
import {
  createHandlerContext,
  parseJsonBody,
  queryParam,
  queryParams,
  createCrudHandlers,
  applyCollectionFilter,
  parseListFilter,
} from "@eristack/backseat";
```

Use when building custom adapters or testing filter logic in isolation.
