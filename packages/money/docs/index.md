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
- Currency-aware rounding for ledgers and invoices
- Allocation/split that always sums back to the original amount
- Formatting/parsing for UI and JSON-safe serialization for APIs
- FX conversion using **rates you supply** (no bundled market feeds)

## Design highlights

- **Single `Money` type** — callers do not pick FastMoney vs Money
- **Adaptive engine** — uses `bigint` minor units when safe, promotes to decimal when scale or precision requires it
- **String-first constructors** — prefer `"19.99"` over `19.99`
- **JSR 354-shaped API** — `CurrencyUnit`, `MonetaryAmount`, operators, queries, rounding

## Next steps

- [Getting started](./getting-started.md)
- [Concepts](./concepts.md)
- [ERP recipes](./recipes.md)
