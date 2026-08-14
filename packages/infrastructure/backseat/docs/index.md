---
title: Overview
description: In-browser mock REST backend for TanStack Query prototypes
---

# @eristack/backseat

**Status: alpha** — a fake backend server that runs entirely in the browser while you build frontend-first.

## What it is

Backseat gives you the pieces a real backend has — **persistence, routing, controllers** — without standing up Express, Drizzle, or Postgres yet.

```text
Your React app
  └── TanStack Query
        └── Backseat engine (browser)
              ├── Store      IndexedDB or memory
              ├── Router     REST paths + splat routes
              └── Controllers  yours — CRUD shortcuts optional
```

Use it when:

- ERP screens need realistic list/detail/mutation flows before API exists
- Query cache keys and DTO shapes should match what production will look like
- Designers and PMs need persistent demo data across refreshes
- Agents need **snapshots and handler code** to infer the real backend later

Do **not** use it for production auth, server validation, or deployed persistence.

## Package exports

| Import | Contents |
| --- | --- |
| `@eristack/backseat` | `createBackseat`, memory store, types, CRUD helpers, context utilities |
| `@eristack/backseat/store` | `createIndexedDbBackseatStore` — **browser prototype default** |
| `@eristack/backseat/react` | Provider, Query hooks, `<BackseatDevtools />` |
| `@eristack/backseat/seeds` | `createErpDemoSnapshot()` — partners, products, open PO |

## Mental model

| Piece | Think of it as… |
| --- | --- |
| **Collection** | A table-ish bucket of JSON documents (`products`, `purchaseOrders`) |
| **Handler** | Direct function Query calls — `api.handlers.products.list()` |
| **Route** | HTTP controller — same logic exposed at `/api/products` |
| **Action** | Named controller with no URL — `api.invoke("reports.openPoCount", input)` |
| **Snapshot** | Full database export/import — seed packs, bug reports, agent handoff |
| **Devtools** | UI to insert, delete, reset, re-seed without writing SQL |

CRUD collections are **shortcuts**. Complex ERP logic uses `registerRoute` and `registerAction`.

## Minimal example

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createErpDemoSnapshot } from "@eristack/backseat/seeds";

export const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "my-erp" }),
  baseUrl: "/api",
  seed: createErpDemoSnapshot,
  collections: {
    partners: {},
    products: {},
    purchaseOrders: {},
  },
});

await api.reseed();
```

```tsx
// Query — call handlers directly (preferred)
useQuery({
  queryKey: ["purchaseOrders"],
  queryFn: () => api.handlers.purchaseOrders.list({ where: { status: "approved" } }),
});
```

## Flexible controllers

```ts
// HTTP — multi-collection processing, splat paths, query params
api.registerRoute({
  method: "POST",
  path: "/procurement/po/:id/approve",
  name: "approve-po",
  handler: async (ctx) => {
    const { note } = ctx.json<{ note?: string }>();
    const po = await ctx.store.get("purchaseOrders", ctx.params.id);
    if (!po || po.status !== "submitted") {
      return { status: 409, body: { error: { code: "INVALID_STATE", message: "PO not submitted" } } };
    }
    const updated = await ctx.store.update("purchaseOrders", ctx.params.id, {
      status: "approved",
      approvedNote: note,
    });
    return { status: 200, body: updated };
  },
});

// Named action — aggregations without REST shape
api.registerAction("dashboard.openPoCount", async ({ store }) => {
  const orders = await store.list("purchaseOrders", { where: { status: "approved" } });
  return { count: orders.length };
});
```

## Compared to alternatives

| | MSW | RESTless / json-server | Backseat |
| --- | --- | --- | --- |
| **Persistence** | You bring it | Built-in localStorage/IDB | Pluggable store port |
| **Architecture** | Network intercept only | Monolithic server class | Store + router + controllers |
| **TanStack Query** | Manual `queryFn` wiring | Usually via `fetch` | Direct handlers + hooks |
| **Custom logic** | Per-request handlers | Route callbacks | `registerRoute` + `registerAction` |
| **Inspect data** | External | Admin UI (RESTless) | `<BackseatDevtools />` + snapshots |
| **Production path** | Swap to real API | Replace | Keep DTOs; agents peek at Backseat when backend is built |

**Store default:** IndexedDB in the browser. Memory store is for **unit tests only**.

## Documentation map

| Doc | Read when |
| --- | --- |
| [Getting started](./getting-started.md) | First integration — bootstrap, Query, mutations |
| [Architecture](./architecture.md) | How layers fit together |
| [Controllers](./controllers.md) | Complex routes, actions, ERP patterns |
| [API reference](./api-reference.md) | Types, methods, hooks, query params |
| [Devtools](./devtools.md) | Local data panel — insert, reset, re-seed |
| [Graduation](./graduation.md) | Frontend-first → real backend handoff |
| [Vision](./vision.md) | Non-goals and design constraints |

## React shell

```tsx
import { BackseatProvider, BackseatDevtools, useBackseatList } from "@eristack/backseat/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BackseatProvider backseat={api}>
      {children}
      {import.meta.env.DEV ? <BackseatDevtools /> : null}
    </BackseatProvider>
  );
}
```

See [Getting started](./getting-started.md) for the full file layout and [Controllers](./controllers.md) for procurement-style examples.
