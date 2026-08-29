---
title: Getting started
description: End-to-end epoch wiring — core, Drizzle, HTTP, React Query, Backseat
---

# Getting started

**Read this page only** for integration. Adapters are copy-paste sections below — no need to open every subpath doc.

## Install

```bash
pnpm add @eristack/epoch
# production persistence:
pnpm add @eristack/epoch drizzle-orm
# optional shells:
pnpm add @eristack/epoch express @eristack/epoch/react @tanstack/react-query
```

## Core (server or shared)

```ts
import { createEpoch, createMemoryEpochStore } from "@eristack/epoch";

const epoch = createEpoch({ store: createMemoryEpochStore() }); // tests only

// After mutating orders:
await epoch.bump("orders");

// Before returning cached data to client:
const { policy, current } = await epoch.resolveCachePolicy("orders", clientEpoch);
// policy: "use-cache" | "refetch"
```

**Production:** swap memory for Drizzle (next section).

### Optimistic bump

```ts
await epoch.bump("orders", { expected: 4 }); // throws StaleEpochError if current !== 4
```

### Stale logging + Zod

```ts
import { withEpochStaleLogging } from "@eristack/epoch";
import { loggerToEpochSink } from "@eristack/epoch/logger";
import { bumpEpochBodySchema } from "@eristack/epoch/zod";
```

Wrap `createEpoch` with `withEpochStaleLogging` when you want structured logs on `refetch` decisions.

## Drizzle (production default)

```ts
import { createEpoch, createEpochTables, createDrizzleEpochStore } from "@eristack/epoch/drizzle";

const tables = createEpochTables("pgsql", "epoch");
const store = createDrizzleEpochStore({ db, tables });
const epoch = createEpoch({ store });
```

Table: `{prefix}_counters` — `scope` PK, `value` integer, `updated_at`.

**After any mutation that invalidates a scope:**

```ts
await epoch.bump("orders");
await epoch.bumpMany(["orders", "order-lines", "dashboard"]);
```

## HTTP — Express

```ts
import express from "express";
import { createEpochRouter } from "@eristack/epoch/express";

const app = express();
app.use(express.json());
app.use("/api/epoch", createEpochRouter({ epoch }));
```

Routes (relative to mount):

| Method | Path | Response |
| --- | --- | --- |
| GET | `/:scope` | `{ scope, value }` |
| POST | `/:scope/bump` | `{ scope, value }` body `{ expected?, by? }` |
| GET | `/:scope/cache-policy?clientEpoch=` | `{ scope, clientEpoch, current, policy }` |

## HTTP — Nest

```ts
import { EpochModule } from "@eristack/epoch/nest";

@Module({
  imports: [EpochModule.forRoot({ epoch })],
})
export class AppModule {}
```

Controller prefix: `/epoch`.

## Client + TanStack Query

```ts
import { createEpochClient } from "@eristack/epoch/client";
import { useEpochCachePolicy } from "@eristack/epoch/react";

const epochClient = createEpochClient({
  baseUrl: import.meta.env.VITE_API_URL,
  basePath: "/api/epoch",
});

function OrdersList({ cachedEpoch }: { cachedEpoch: number }) {
  const policy = useEpochCachePolicy(epochClient, "orders", cachedEpoch);

  if (policy.data?.policy === "refetch") {
    // invalidate orders queries — app-owned QueryClient call
  }

  return null;
}
```

Store `cachedEpoch` next to your Query cache metadata (or in query key as `['orders', { epoch }]`).

## Cache policy flow (recommended)

```text
Query fetch stores { data, epoch: serverValue }
        │
        ▼
On focus / stale check / manual refresh
        │
        ▼
GET cache-policy?clientEpoch=N  (or epoch.resolveCachePolicy locally on server)
        │
        ├── use-cache → serve Query cache
        └── refetch   → queryClient.invalidateQueries(...)
        │
        ▼
After successful mutation handler
        │
        ▼
epoch.bump(scope)  → clients eventually see refetch
```

## Backseat prototype

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbEpochStores, registerEpochBackseat } from "@eristack/epoch/backseat/store";
import { createEpoch } from "@eristack/epoch";

const { backseatStore, epochStore } = createIndexedDbEpochStores({ dbName: "my-erp" });
const epoch = createEpoch({ store: epochStore });
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerEpochBackseat(api, { epoch, basePath: "/epoch" });
```

Default `basePath`: `/epoch`. Collection: `epoch.counters`.

Cross-package Backseat matrix: [@eristack/ai-knowledge upgrading §3](/docs/ai-knowledge/upgrading).

## Scope naming

Use stable opaque keys your app owns:

- Global: `"catalog"`, `"settings"`
- Entity family: `"orders"`, `"products"`
- Tenant-scoped: `"tenant:abc:orders"`

Keep scopes coarse enough to avoid bump storms, fine enough to limit refetch blast radius.

## Stale policy naming (client)

| Server `policy` | Meaning | Client action |
| --- | --- | --- |
| `use-cache` | `clientEpoch === current` | Serve TanStack Query cache |
| `refetch` | Client behind server epoch | `invalidateQueries` for that scope |

Name scopes after **cache partitions**, not routes (`orders`, not `/api/orders/list`). Pair list + detail queries on the same scope; bump once per successful mutation batch.
