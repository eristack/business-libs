---
title: @eristack/money
description: JSR 354–inspired money primitives for ERP and business software
sidebar_position: 1
---

# @eristack/money

`@eristack/money` is a TypeScript money library modeled after [JSR 354](https://jcp.org/en/jsr/detail?id=354) (Java Money & Currency), tailored for ERP and business applications.

## When to use it

Use this package when you need:

- Immutable monetary amounts with strict currency checks
- Exact arithmetic without binary floating-point surprises
- Totals, percentages, discounts, and tax helpers for everyday ERP math
- Currency-aware rounding for ledgers and invoices
- Allocation/split that always sums back to the original amount
- Formatting/parsing for UI and JSON-safe serialization for APIs
- FX conversion using **rates you supply** (no bundled market feeds)

## Design highlights

- **Single `Money` type** — callers do not pick FastMoney vs Money
- **Adaptive engine** — uses `bigint` minor units when safe, promotes to decimal when scale or precision requires it
- **String-first constructors** — prefer `"19.99"` over `19.99`
- **Percent points are explicit** — `percentOf("7")` means 7%, not `0.07`
- **JSR 354-shaped API** — `CurrencyUnit`, `MonetaryAmount`, operators, queries, rounding

## Adapter subpaths

Core stays framework-free. Optional exports map wire JSON, SQL columns, and form state:

```text
@eristack/money                      core — Money, round, allocate, FX
        ├── /drizzle                 SQL columns + pack/unpack
        ├── /rest                    parseMoneyJSON / serializeMoney
        ├── /zod                     Zod 4 schemas (peer zod ^4)
        ├── /express                 readMoney / sendMoney
        ├── /nest                    ParseMoneyPipe
        ├── /client                  reviveMoney after fetch
        └── /react                   TanStack Form string helpers
```

Start at [Adapters overview](./adapters.md), then open the guide for the subpath you wire.

## Next steps

- [Getting started](./getting-started.md) — install and first amount
- [Concepts](./concepts.md) — immutability, currency safety, adaptive engine, operators
- [Advanced arithmetic](./advanced-arithmetic.md) — totals, percentages, tax and discount
- [Rounding](./rounding.md) — modes and ledger boundaries
- [Allocate & split](./allocate.md) — parts that always sum back
- [Currency conversion](./conversion.md) — rates you supply
- [Gotchas](./gotchas.md) — rejected constructors, mixed currencies, JSON numbers, scale `-1`
- [Serialization](./serialization.md) — wire JSON for APIs
- [Adapters overview](./adapters.md) — then [Drizzle](./drizzle.md) · [REST](./rest.md) · [Zod](./zod.md) · [Express](./express.md) · [Nest](./nest.md) · [Client](./client.md) · [React](./react.md)
- [ERP recipes](./recipes.md) — invoices, payment allocation, multi-currency reporting
- [API reference](./api-reference.md) — public exports cheat-sheet
