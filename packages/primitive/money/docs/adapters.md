---
title: Adapters overview
description: Subpath exports — wire JSON vs SQL columns vs hash-chained text
sidebar_position: 13
---

# Adapters overview

Core `@eristack/money` is framework-free. **Adapters** are optional subpaths that map money between three representations:

| Layer | Shape | Adapter doc |
| --- | --- | --- |
| **Wire / API / contracts** | Nested `MoneyJSON`: `{ currency, amount }` strings | [REST](./rest.md) · [Zod](./zod.md) |
| **HTTP frameworks** | Same wire shape on `req.body` / DTO params | [Express](./express.md) · [Nest](./nest.md) |
| **Browser fetch** | Revive JSON → `Money` after HTTP | [Client](./client.md) |
| **TanStack Form** | String `{ currency, amount }` in field state | [React](./react.md) |
| **App SQL tables** | Flat `*_amount` + `currency` columns | [Drizzle](./drizzle.md) |
| **Hash-chained ledger** | Decimal **text** inside hashed payloads | Core + dependent packages — **not** Drizzle numeric |

Wire rules: [serialization](./serialization.md). Core math: [getting started](./getting-started.md).

## Subpath map

```text
@eristack/money                         core — Money, round, allocate, FX, moneyToJSON
        │
        ├── /drizzle                    SQL columns, pack/unpack, naming config
        ├── /rest                       parseMoneyJSON / serializeMoney (no router)
        ├── /zod                        Zod 4 schemas (peer zod ^4)
        ├── /express                    readMoney / sendMoney → /rest
        ├── /nest                       ParseMoneyPipe → /rest
        ├── /client                     reviveMoney after fetch (no React)
        └── /react                      TanStack Form string helpers → /client patterns
```

Core never imports Drizzle, Express, Nest, React, or Zod. `/express` and `/nest` never duplicate validation — they call `/rest`. `/react` does not replace `/client`; use `/client` in non-React apps and `/react` for form state.

## Install peers

```bash
pnpm add @eristack/money
# Only what you wire:
pnpm add drizzle-orm          # ./drizzle
pnpm add zod@^4             # ./zod
pnpm add express            # ./express
pnpm add @nestjs/common     # ./nest
pnpm add @tanstack/react-form  # ./react (optional)
```

## Where to go next

| Guide | Read when |
| --- | --- |
| [Drizzle](./drizzle.md) | Persisting amounts in Postgres/MySQL/SQLite |
| [REST](./rest.md) | Parsing bodies or building headless REST actions |
| [Zod](./zod.md) | `packages/contracts` or Nest Zod pipes |
| [Express](./express.md) | Express routes |
| [Nest](./nest.md) | `@Body` pipes |
| [Client](./client.md) | Fetch results → `Money` |
| [React](./react.md) | TanStack Form defaults and submit |
| [Serialization](./serialization.md) | Wire JSON shape |
| [Gotchas](./gotchas.md) | Float rejection, mixed currency |

## Hash-chained ledgers

`@eristack/financial-ledger`, `@eristack/valuations` value chains, and `@eristack/hash-chained-ledger` store amounts as **decimal strings in the hash**. Do not migrate those columns to SQL `numeric` or split currency out of the payload — chains would break.

| Package | Hashed strings | Typed read / app SQL |
| --- | --- | --- |
| `@eristack/financial-ledger` | `post()` → decimal text | `hydrateLedgerEntry` → `Money` |
| `@eristack/valuations` | Value chain | Layers: `unitCostAmount` + `currency` via [Drizzle](./drizzle.md) |
| `@eristack/qups` | N/A | [qupsLineColumns](/docs/qups/stores) — shared `currency` + `*_amount` |

## Corruption rules (all adapters)

1. Never JSON-number or float amounts on the wire.
2. SQL: pack/unpack through [Drizzle](./drizzle.md) — do not set amount/currency columns independently.
3. ERP lines: one shared `currency` + amount-only columns.
4. Round with `Rounding.currencyDefault()` before SQL pack and ledger post.
5. Hash-chained payloads stay decimal text forever.
