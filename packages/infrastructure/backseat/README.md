# @eristack/backseat

**Frontend-first fake backend** — store, router, flexible controllers, TanStack Query hooks, and devtools for in-browser ERP prototypes.

## Install

```bash
pnpm add @eristack/backseat @tanstack/react-query
```

## Quick example

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createErpDemoSnapshot } from "@eristack/backseat/seeds";

export const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "demo-erp" }),
  baseUrl: "/api",
  seed: createErpDemoSnapshot,
  collections: { partners: {}, products: {}, purchaseOrders: {} },
});

await api.reseed();

// TanStack Query
const orders = await api.handlers.purchaseOrders.list({
  where: { status: "approved" },
});
```

```tsx
import { BackseatProvider, BackseatDevtools } from "@eristack/backseat/react";

<BackseatProvider backseat={api}>
  <App />
  {import.meta.env.DEV ? <BackseatDevtools /> : null}
</BackseatProvider>
```

## Docs

| Guide | Topic |
| --- | --- |
| [Overview](./docs/index.md) | Mental model, exports, comparisons |
| [Getting started](./docs/getting-started.md) | Full integration walkthrough |
| [Controllers](./docs/controllers.md) | Custom routes, actions, ERP patterns |
| [API reference](./docs/api-reference.md) | Types, methods, hooks |
| [Devtools](./docs/devtools.md) | Insert, reset, re-seed, snapshots |
| [Graduation](./docs/graduation.md) | Frontend-first → real backend |
| [Architecture](./docs/architecture.md) | Store / router / controller layers |
| [Vision](./docs/vision.md) | Goals and non-goals |

**Default store:** IndexedDB in browser · **Memory store:** unit tests only · **Not for production persistence.**
