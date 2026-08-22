---
title: Adapters overview
description: Subpath exports mirroring @eristack/money — wire JSON vs SQL vs HTTP
sidebar_position: 10
---

# Adapters overview

Core `@eristack/timestamp` is framework-free. **Adapters** are optional subpaths that map timestamps between wire JSON, SQL columns, HTTP frameworks, and form state — same spine as `@eristack/money`.

| Layer | Shape | Adapter doc |
| --- | --- | --- |
| **Wire / API / contracts** | Discriminated `TimestampJSON` (`kind: instant \| wall`) | [REST](./rest.md) · [Zod](./zod.md) |
| **HTTP frameworks** | Same wire shape on `req.body` / DTO params | [Express](./express.md) · [Nest](./nest.md) |
| **Browser fetch** | Revive JSON → typed `Timestamp` after HTTP | [Client](./client.md) |
| **TanStack Form** | `TimestampJSON` in field state | [React](./react.md) |
| **App SQL tables** | Instant: `timestamptz` + zone; wall: `local text` + zone | [Drizzle](./drizzle.md) |
| **Hash-chained ledger** | UTC ISO in hash payload | Core serialize — prefer **instant** at post |

Wire rules: [Serialization](./serialization.md). Mode choice: [Recipes](./recipes.md).

## Subpath map

```text
@eristack/timestamp                         core — instantOf, wallOf, parse, compare
        │
        ├── /drizzle                        instantField, wallField, pack/unpack
        ├── /rest                           parseTimestampJSON / serializeTimestamp
        ├── /zod                            Zod 4 schemas (peer zod ^4)
        ├── /express                        readTimestamp / sendTimestamp → /rest
        ├── /nest                           ParseTimestampPipe → /rest
        ├── /client                         reviveTimestamp after fetch
        └── /react                          TanStack Form helpers
```

Import spine (hard rules):

- Core **never** imports Drizzle, Express, Nest, React, Zod.
- `/express` and `/nest` **never** duplicate validation — they call `/rest`.
- `/react` does **not** replace `/client`.

## Install peers

```bash
pnpm add @eristack/timestamp
# Only what you wire:
pnpm add drizzle-orm          # ./drizzle
pnpm add zod@^4               # ./zod
pnpm add express              # ./express
pnpm add @nestjs/common       # ./nest
pnpm add @tanstack/react-form # ./react (optional)
```

## Where to go next

| Guide | Read when |
| --- | --- |
| [Drizzle](./drizzle.md) | Persisting instants or wall times in Postgres/MySQL/SQLite |
| [REST](./rest.md) | Parsing bodies or building headless REST actions |
| [Zod](./zod.md) | `packages/contracts` or Nest Zod pipes |
| [Express](./express.md) | Express routes |
| [Nest](./nest.md) | `@Body` pipes |
| [Client](./client.md) | Fetch results → typed timestamps |
| [React](./react.md) | TanStack Form defaults and submit |
| [Serialization](./serialization.md) | Wire JSON shape |
| [Gotchas](./gotchas.md) | DST gaps, wall vs instant |

## Corruption rules (all adapters)

1. **instant** wire → UTC `Z` after validate.
2. **wall** wire → no offset on `local`.
3. SQL pack/unpack through Drizzle bindings — no independent column writes.
4. IANA only in `timezone` columns.
5. Never silently store wall `local` in `timestamptz`.
6. Hash-chained payloads: keep UTC ISO in hash unless versioned migration.
