---
title: "@eristack/percent"
description: Percent and basis-point ratios as strings for tax and discounts
sidebar_position: 1
---

# @eristack/percent

`@eristack/percent` stores **rates and ratios as decimal strings** — `"0.11"` for 11%, basis points `"1100"` for 11.00% — so tax, discount, and markup math never touches JS float literals. Complements `@eristack/money` (amounts) and `@eristack/qups` (line calculators).

## When to use it

Use this package when you need:

- Parse `"11%"`, `"0.11"`, or basis points from ERP master data
- `percentOf`, `plusPercent`, `minusPercent` on string amounts before rounding with `@eristack/money`
- Serializable `{ ratio }` JSON for API contracts
- Zod 4 validation for percent fields

## Relationship to @eristack/money

`@eristack/money` includes `percentOf` on `Money` for **currency-safe** totals after you know the rate. Use `@eristack/percent` when the rate itself is the domain value (tax codes, tier tables, QUPS modifiers) and you want a dedicated ratio type.

## Subpaths

```text
@eristack/percent                    core — parsePercent, fromBasisPoints, percentOf
        └── /zod                     percentSchema (peer zod ^4)
```

## Next steps

- [Getting started](./getting-started.md) — parse, apply to line amount
- [Concepts](./concepts.md) — ratio vs percent symbol vs bps
- [Basis points](./basis-points.md) — finance rates, VAT tables
- [Arithmetic](./arithmetic.md) — percentOf, plus/minus, combining rates
- [Zod](./zod.md) — wire validation
- [Gotchas](./gotchas.md) — double-scaling, negative rates, money rounding order
- [Recipes](./recipes.md) — tax line, stacked discount, QUPS modifier
- [API reference](./api-reference.md) — exports cheat-sheet
