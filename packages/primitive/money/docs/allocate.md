---
title: Allocate & split
description: Split money across parties without losing cents
sidebar_position: 8
---

# Allocate & split

Splitting money with plain division leaves remainder cents. `@eristack/money` uses **largest-remainder** allocation so parts always sum to the original (currency-rounded) amount.

## Equal split

```ts
const total = Money.of("10.00", "USD");
const [a, b, c] = total.allocate(3);
// 3.34 + 3.33 + 3.33 === 10.00
```

## Ratio split

```ts
const total = Money.of("100.00", "USD");
const parts = total.allocateByRatios([1, 2, 1]);
// 25 + 50 + 25
```

## When to use

- Split invoices across cost centers
- Distribute payment across open items
- Share fees among parties

Amounts are rounded to the currency scale before allocation. Prefer rounding explicitly first if your business rule requires a specific mode.
