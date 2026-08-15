---
title: Concepts
description: Epoch scopes, cache policy, optimistic bumps
---

# Concepts

## Scope

An **epoch scope** is a string key for a cache partition. All list/detail queries that should invalidate together share one scope.

## Epoch value

Non-negative integer, monotonic per scope. Starts at **0** (never bumped). First bump → **1**, etc.

## Cache policy

| Policy | Meaning |
| --- | --- |
| `use-cache` | Client epoch === server epoch — cached data is still valid |
| `refetch` | Mismatch — fetch fresh data |

Pure helper: `compareEpochs(client, server)` from `@eristack/epoch`.

## When to bump

Bump **after** successful writes that change data covered by the scope:

- Create/update/delete order → `bump("orders")`
- Master data edit affecting many screens → `bump("products")`

Do **not** bump on read-only requests.

## StaleEpochError

Thrown when:

- `bump(scope, { expected })` and `expected !== current`
- `assertFresh(scope, clientEpoch)` and client is behind

Use for optimistic concurrency on the bump itself (admin “force refresh” tools), not for every read.

## vs ETag

Epoch is **application-level** and scope-oriented — works the same for Backseat prototypes, REST, and in-process server code. ETags can still wrap HTTP responses; epoch drives Query cache decisions.
