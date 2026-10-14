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
| React | `@eristack/epoch/react` | `useEpochCurrent`, `useEpochCachePolicy`, `useEpochInvalidation`, `epochCurrentQueryKey` |
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

## React Query invalidation

**Detail screens** — bind one scope to one query key (default exact match so list bumps do not refetch prefix children):

```tsx
import { useEpochInvalidation } from "@eristack/epoch/react";

useEpochInvalidation(epochClient, "jobs", ["job", jobId], { exact: true });
```

**List / register** — same hook with `exact: false` when a scope bump should invalidate every query under a prefix.

`useEpochCachePolicy` is the lower-level alternative: when `policy === "refetch"`, invalidate manually and store the new `current` epoch when refetch completes.
