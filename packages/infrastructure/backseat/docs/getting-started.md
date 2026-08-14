---
title: Getting started
description: Wire Backseat into a React + TanStack Query app
---

# Getting started

End-to-end setup for a frontend-first ERP prototype.

## Install

```bash
pnpm add @eristack/backseat @tanstack/react-query react
```

Subpaths (`/store`, `/react`, `/seeds`) ship from the same package — no extra install.

## Recommended file layout

```text
src/
  backseat/
    api.ts           createBackseat + export singleton
    controllers.ts   registerRoute / registerAction (complex logic)
    bootstrap.ts     reseed on app start (dev)
  app/
    providers.tsx    BackseatProvider + Devtools
  features/
    products/
      use-products.ts   Query hooks (handlers or useBackseatList)
```

Keep **engine wiring** in `backseat/` and **feature hooks** next to screens.

## 1 · Create the engine

`src/backseat/api.ts`:

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createErpDemoSnapshot } from "@eristack/backseat/seeds";

export const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "demo-erp" }),
  baseUrl: "/api",
  seed: createErpDemoSnapshot,
  collections: {
    partners: {},
    products: {},
    purchaseOrders: {},
  },
});
```

This registers CRUD for each collection:

| HTTP | Handler |
| --- | --- |
| `GET /api/products` | `api.handlers.products.list()` |
| `POST /api/products` | `api.handlers.products.create(body)` |
| `GET /api/products/:id` | `api.handlers.products.get(id)` |
| `PATCH /api/products/:id` | `api.handlers.products.patch(id, body)` |
| `DELETE /api/products/:id` | `api.handlers.products.delete(id)` |

Collection **name** (store key) and REST **path** can differ:

```ts
collections: {
  purchaseOrders: { path: "procurement/purchase-orders" },
},
// → GET /api/procurement/purchase-orders
// → api.handlers.purchaseOrders.* (store key unchanged)
```

## 2 · Bootstrap seed data

`src/backseat/bootstrap.ts`:

```ts
import { api } from "./api.js";

let booted = false;

/** Idempotent dev bootstrap — seeds only when store is empty. */
export async function ensureBackseatSeeded() {
  if (booted) return;
  const collections = await api.store.listCollections();
  if (collections.length === 0) {
    await api.reseed();
  }
  booted = true;
}
```

Call from app entry:

```ts
await ensureBackseatSeeded();
```

Or always re-seed in dev (destructive):

```ts
if (import.meta.env.DEV) await api.reseed();
```

## 3 · Register custom controllers

Move non-CRUD logic to `src/backseat/controllers.ts`:

```ts
import { api } from "./api.js";

export function registerBackseatControllers() {
  api.registerRoute({
    method: "POST",
    path: "/procurement/po/:id/submit",
    name: "submit-po",
    handler: async (ctx) => {
      const po = await ctx.store.get("purchaseOrders", ctx.params.id);
      if (!po) {
        return { status: 404, body: { error: { code: "NOT_FOUND", message: "PO not found" } } };
      }
      const updated = await ctx.store.update("purchaseOrders", ctx.params.id, {
        status: "submitted",
      });
      return { status: 200, body: updated };
    },
  });

  api.registerAction("procurement.openPoByPartner", async ({ input, store }) => {
    const { partnerId } = input as { partnerId: string };
    return store.list("purchaseOrders", {
      where: { partnerId, status: "approved" },
    });
  });
}

registerBackseatControllers();
```

Import `./controllers.js` once from `api.ts` or app bootstrap.

## 4 · TanStack Query — lists

**Option A — direct handlers (most control):**

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/backseat/api";

export function useApprovedPurchaseOrders() {
  return useQuery({
    queryKey: ["purchaseOrders", { status: "approved" }],
    queryFn: () =>
      api.handlers.purchaseOrders.list({ where: { status: "approved" } }),
  });
}
```

**Option B — React helpers (inside `BackseatProvider`):**

```tsx
import { useBackseatList } from "@eristack/backseat/react";

export function ProductList() {
  const { data, isLoading } = useBackseatList("products", {
    sort: "name",
    order: "asc",
  });
  if (isLoading) return null;
  return (
    <ul>
      {data?.map((p) => (
        <li key={String(p.id)}>{String(p.name)}</li>
      ))}
    </ul>
  );
}
```

**Option C — named actions:**

```ts
useQuery({
  queryKey: ["open-pos", partnerId],
  queryFn: () => api.invoke("procurement.openPoByPartner", { partnerId }),
});
```

## 5 · Mutations

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/backseat/api";

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; name: string; sku: string }) =>
      api.handlers.products.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

Or `useBackseatCreate("products")` from `@eristack/backseat/react` — invalidates list keys automatically.

## 6 · App providers

`src/app/providers.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackseatProvider, BackseatDevtools } from "@eristack/backseat/react";
import { api } from "@/backseat/api";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BackseatProvider backseat={api}>
        {children}
        {import.meta.env.DEV ? <BackseatDevtools position="bottom-right" /> : null}
      </BackseatProvider>
    </QueryClientProvider>
  );
}
```

## 7 · Optional fetch shim

When migrating from `fetch`-based client code:

```ts
const res = await api.fetch("/api/products?status=approved");
const items = await res.json();
```

Prefer handlers for new code — fewer moving parts, easier graduation.

## Tests

Always use the memory store in Node/Vitest:

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";

const api = createBackseat({
  store: createMemoryBackseatStore(),
  collections: { products: {} },
});

await api.handlers.products.create({ id: "p1", name: "Desk" });
expect(await api.handlers.products.list()).toHaveLength(1);
```

Never call `createIndexedDbBackseatStore()` in unit tests — IndexedDB is unavailable in Node.

## Next steps

- [Controllers](./controllers.md) — approval flows, splat routes, cross-collection rules
- [Devtools](./devtools.md) — insert fixtures without code changes
- [Graduation](./graduation.md) — hand off to real backend + Drizzle
- [API reference](./api-reference.md) — full type surface
