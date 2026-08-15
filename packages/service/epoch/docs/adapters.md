---
title: Adapters
description: Express, Nest, REST, client, React — copy-paste wiring
---

# Adapters

Canonical end-to-end guide: [Getting started](./getting-started.md). This page lists adapter entrypoints only.

| Adapter | Import | Main symbols |
| --- | --- | --- |
| REST | `@eristack/epoch/rest` | `createRestEpochActions`, `toEpochErrorResponse` |
| Express | `@eristack/epoch/express` | `createEpochRouter` |
| Nest | `@eristack/epoch/nest` | `EpochModule`, `EPOCH`, `EpochController` |
| Client | `@eristack/epoch/client` | `createEpochClient` |
| React | `@eristack/epoch/react` | `useEpochCurrent`, `useEpochCachePolicy`, `epochCurrentQueryKey` |
| Drizzle | `@eristack/epoch/drizzle` | `createEpochTables`, `createDrizzleEpochStore` |

## REST actions (custom framework)

```ts
import { createRestEpochActions } from "@eristack/epoch/rest";

const actions = createRestEpochActions({ epoch });
const res = await actions.resolveCachePolicy({
  params: { scope: "orders" },
  query: { clientEpoch: "3" },
  headers: { get: () => null },
});
```

## React Query invalidation (app-owned)

`useEpochCachePolicy` returns `{ policy, current }`. When `policy === "refetch"`:

```ts
queryClient.invalidateQueries({ queryKey: ["orders"] });
```

Store the new `current` epoch when refetch completes.
