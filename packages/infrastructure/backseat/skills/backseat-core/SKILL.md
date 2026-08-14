---
name: backseat-core
description: >
  @eristack/backseat: frontend-first in-browser REST engine — flexible registerRoute
  controllers, registerAction, splat paths, IndexedDB store, BackseatDevtools.
  Memory store for tests only. Agents peek at handlers/snapshots when backend is built later.
metadata:
  type: core
  library: "@eristack/backseat"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/infrastructure/backseat/docs/index.md"
  - "eristack/business-libs:packages/infrastructure/backseat/docs/getting-started.md"
  - "eristack/business-libs:packages/infrastructure/backseat/docs/controllers.md"
  - "eristack/business-libs:packages/infrastructure/backseat/docs/api-reference.md"
  - "eristack/business-libs:packages/infrastructure/backseat/docs/devtools.md"
  - "eristack/business-libs:packages/infrastructure/backseat/docs/graduation.md"
---

# Backseat core

Frontend-first **fake backend** in the browser — store + router + **your** controllers.

## When to use

- ERP UX before API exists
- Complex Query via `registerAction` or custom `registerRoute`
- Local dev with `<BackseatDevtools />` (insert, reset, re-seed, snapshot)
- Handoff artifacts for backend work (snapshots + controller source)

## When not to use

- Production persistence → Drizzle + Postgres
- Auth → `@eristack/jwt-auth`
- Rigid CRUD-only assumption → use custom controllers for workflows

## Package map

| Import | Use |
| --- | --- |
| `@eristack/backseat` | `createBackseat`, memory store, types |
| `@eristack/backseat/adapters` | `registerRestLikeRoutes`, REST bridge helpers |
| `@eristack/backseat/store` | `createIndexedDbBackseatStore()` — **browser default** |
| `@eristack/backseat/react` | Provider, hooks, `BackseatDevtools` |
| `@eristack/backseat/seeds` | `createErpDemoSnapshot()` |

## Default wiring

```ts
const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "my-app" }),
  baseUrl: "/api",
  seed: createErpDemoSnapshot,
  collections: { products: {}, purchaseOrders: {} },
});
```

## Controller surfaces

1. **CRUD shortcuts** — `api.handlers.{collection}.list/get/create/patch/delete`
2. **HTTP** — `registerRoute({ method, path, handler })` — use `ctx.json()`, `ctx.query()`, splat `/*`
3. **Named** — `registerAction(name, fn)` + `api.invoke(name, input)`

CRUD collections are optional convenience — not the ceiling.

## TanStack Query

```ts
// Handlers
useQuery({ queryKey: ["products"], queryFn: () => api.handlers.products.list() });

// Actions
useQuery({
  queryKey: ["open-pos", supplierId],
  queryFn: () => api.invoke("procurement.openPoByPartner", { supplierId }),
});
```

React hooks: `useBackseatList`, `useBackseatGet`, `useBackseatCreate`, `useBackseatPatch`, `useBackseatDelete` inside `BackseatProvider`.

## Devtools

```tsx
{import.meta.env.DEV ? <BackseatDevtools position="bottom-right" /> : null}
```

Reset, re-seed (`createBackseat({ seed })`), insert JSON docs, export/import snapshot.

## Tests

`createMemoryBackseatStore()` only — never IndexedDB in Node.

## Graduation

Swap `queryFn` to real REST client; keep query keys. Agents read `controllers.ts` + snapshots — **no** shared OpenAPI contract from Backseat.

Full guides: `docs/controllers.md`, `docs/graduation.md`, `docs/api-reference.md`.
