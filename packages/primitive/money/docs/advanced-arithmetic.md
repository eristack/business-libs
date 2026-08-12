---
title: Advanced arithmetic
description: Totals, percentages, discounts, tax helpers, and ratios
sidebar_position: 7
---

# Advanced arithmetic

Everyday ERP helpers on top of [basic arithmetic](./arithmetic.md). Factors stay
**strings** (or integers); never pass fractional JS numbers. There is no
jurisdiction tax engine — rates are opaque percent strings your app supplies.

```ts
import {
  Discount,
  Markup,
  Money,
  Percent,
  Rounding,
  Tax,
} from "@eristack/money";
```

## Totals

```ts
const total = Money.sum([
  Money.of("10.00", "USD"),
  Money.of("2.50", "USD"),
]);

Money.sum([], "USD"); // zero — currency required when empty
Money.min(a, b, c);
Money.max(a, b, c);
Money.average(lines);
```

All amounts must share a currency (`CurrencyMismatchError` otherwise).

## Percentages

Pass **percent points** (`"7"` = 7%), not fractions (`"0.07"`).

```ts
const price = Money.of("200.00", "USD");

price.percentOf("7");     // 14.00
price.plusPercent("10");  // 220.00
price.minusPercent("25"); // 150.00
```

Or as operators:

```ts
price.with(Percent.of("7"));
price.with(Discount.ofPercent("5"));
price.with(Markup.ofPercent("5"));
```

Round at ledger boundaries with `.with(Rounding.currencyDefault())`.

## Tax (rate as opaque percent)

No jurisdiction engine — your app supplies the rate string.

```ts
const round = Rounding.currencyDefault();
const net = Money.of("100.00", "USD");
const tax = net.with(Tax.onExclusive("11")).with(round); // 11.00
const gross = net.add(tax);

gross.with(Tax.netFromInclusive("11")).with(round);      // back to net
gross.with(Tax.extractFromInclusive("11")).with(round);  // tax portion
```

## Ratios (dimensionless)

```ts
Money.ratio(profit, revenue);        // "0.125"
Money.percentRatio(profit, revenue); // "12.5"
```

Returns plain decimal strings — not `Money` — so they are safe to store as rates/margins.
