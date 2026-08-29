---
name: epoch-core
description: >
  @eristack/epoch headless data-version counters: current/bump per scope,
  compareEpochs use-cache vs refetch, resolveCachePolicy, StaleEpochError.
  Drizzle default; memory store tests only.
metadata:
  type: core
  library: "@eristack/epoch"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/service/epoch/docs/getting-started.md"
  - "eristack/business-libs:packages/service/epoch/docs/concepts.md"
---

# Epoch core

Monotonic **epoch counters** per scope for **cache invalidation** — tell clients `use-cache` vs `refetch` without coupling to TanStack Query internals.

## When to use

- ERP lists/details cached in TanStack Query
- Coarse invalidation after mutations (`orders`, `products`, …)
- Optimistic bump with `expected` epoch

## Core API

```ts
import { createEpoch, createMemoryEpochStore, compareEpochs } from "@eristack/epoch";

const epoch = createEpoch({ store: createMemoryEpochStore() }); // tests only

await epoch.bump("orders");
const { policy, current } = await epoch.resolveCachePolicy("orders", clientEpoch);
compareEpochs(clientEpoch, serverEpoch); // "use-cache" | "refetch"
```

Production: `@eristack/epoch/drizzle` — see `#epoch-adapters`.

## Stale epoch logging

```ts
import { createEpoch, withEpochStaleLogging } from "@eristack/epoch";
import { loggerToEpochSink } from "@eristack/epoch/logger";
import { createLogger } from "@eristack/logger";

const epoch = withEpochStaleLogging(createEpoch({ store }), {
  sink: loggerToEpochSink(createLogger({ name: "epoch" })),
});
```

Logs when `resolveCachePolicy` returns `refetch` (client epoch behind server).

## Zod 4

```ts
import { bumpEpochBodySchema, resolveCachePolicyQuerySchema } from "@eristack/epoch/zod";
```

## Rules

- Bump **after** successful writes, not on reads
- Memory store **not** for production (Postgres + Drizzle)
- Scopes are app-owned opaque strings

Full guide: `docs/getting-started.md`.
