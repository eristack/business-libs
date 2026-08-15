---
title: Overview
description: Headless data-version epochs for cache invalidation (use-cache vs refetch)
---

# @eristack/epoch

**Headless data-version counters** — separate from your domain APIs and from TanStack Query itself.

## Problem

After a mutation, should the client **keep cached list/detail data** or **refetch**? Epoch gives a cheap answer:

1. Server bumps a monotonic **epoch** per scope when data changes (`orders`, `products`, …).
2. Client stores the epoch alongside cached Query data.
3. Before serving cache (or on focus/reconnect), compare **client epoch** vs **server epoch**.
4. Same epoch → **`use-cache`**. Different → **`refetch`**.

## What it is not

| Not epoch | Use instead |
| --- | --- |
| Entity revision / row version per record | App column + optimistic locking |
| HTTP ETag middleware | App middleware composing `epoch.assertFresh` |
| Audit log | App tables |
| Document sequence numbers | `@eristack/doc-number` |

## Exports

| Subpath | Use |
| --- | --- |
| `@eristack/epoch` | `createEpoch`, `compareEpochs`, memory store (tests) |
| `@eristack/epoch/drizzle` | `createEpochTables`, `createDrizzleEpochStore` — **production** |
| `@eristack/epoch/rest` | Headless HTTP actions |
| `@eristack/epoch/express` | `createEpochRouter` |
| `@eristack/epoch/nest` | `EpochModule.forRoot` |
| `@eristack/epoch/client` | `createEpochClient` |
| `@eristack/epoch/react` | `useEpochCachePolicy`, `useEpochCurrent` |
| `@eristack/epoch/backseat` | Browser prototype registration |

Full wiring: [Getting started](./getting-started.md).
