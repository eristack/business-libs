---
name: epoch-adapters
description: >
  Wire @eristack/epoch: Drizzle createEpochTables/createDrizzleEpochStore,
  Express createEpochRouter, Nest EpochModule, createEpochClient,
  useEpochCachePolicy and useEpochInvalidation React hooks, registerEpochBackseat for prototypes.
metadata:
  type: adapters
  library: "@eristack/epoch"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/service/epoch/docs/getting-started.md"
  - "eristack/business-libs:packages/service/epoch/docs/adapters.md"
---

# Epoch adapters

## Drizzle (production)

```ts
import { createEpoch, createEpochTables, createDrizzleEpochStore } from "@eristack/epoch/drizzle";

const tables = createEpochTables("pgsql");
const epoch = createEpoch({ store: createDrizzleEpochStore({ db, tables }) });
```

## Express

```ts
import { createEpochRouter } from "@eristack/epoch/express";
app.use("/api/epoch", createEpochRouter({ epoch }));
```

## Client + React Query

```ts
import { createEpochClient } from "@eristack/epoch/client";
import { useEpochCachePolicy, useEpochInvalidation } from "@eristack/epoch/react";

const client = createEpochClient({ baseUrl: API_URL, basePath: "/api/epoch" });
// useEpochCachePolicy(client, "orders", cachedEpoch) → { policy, current }
// useEpochInvalidation(client, "jobs", ["job", id], { exact: true }) → invalidates on scope bump
```

## Backseat

```ts
import { registerEpochBackseat, createIndexedDbEpochStores } from "@eristack/epoch/backseat/store";
```

Default routes under `/epoch`. See `docs/getting-started.md`.
