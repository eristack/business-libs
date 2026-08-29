---
title: "@eristack/uom"
description: Unit-of-measure quantities with fixed-ratio conversion
sidebar_position: 1
---

# @eristack/uom

`@eristack/uom` models **inventory and line quantities** as decimal strings plus a unit code, with **fixed-ratio conversion** within a dimension (mass, volume, count, length). No silent `Number()` — amounts stay strings end-to-end like `@eristack/money`.

## When to use it

Use this package when you need:

- Convert `1.5 kg` → `1500 g` without float drift
- Validate that purchase UOM matches stock UOM dimension before receiving
- Extend the catalog with app-specific units (e.g. `box` = 12 `pcs`)
- Zod 4 schemas for `{ amount, unit }` JSON on APIs and forms

## What it is not

- **Not dimensional analysis** — no automatic density (kg ↔ L) without app rules
- **Not QUPS** — line pricing math stays in `@eristack/qups`; uom converts qty fields only
- **Not persistence** — Drizzle columns are app-owned; store amount + unit as strings

## Subpaths

```text
@eristack/uom                        core — uomQty, convertUom, catalog
        └── /zod                     uomQuantitySchema (peer zod ^4)
```

## Next steps

- [Getting started](./getting-started.md) — first conversion and custom unit
- [Concepts](./concepts.md) — dimensions, base factors, registry
- [Catalog & dimensions](./catalog-and-dimensions.md) — built-in units table
- [Conversion](./conversion.md) — convertUom, errors, rounding
- [Zod](./zod.md) — API validation
- [Gotchas](./gotchas.md) — cross-dimension, negative qty, unknown codes
- [Recipes](./recipes.md) — PO receive, stock on hand, qups line qty
- [API reference](./api-reference.md) — exports cheat-sheet
