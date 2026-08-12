---
title: Currency conversion
description: Convert amounts using application-supplied exchange rates
sidebar_position: 10
---

# Currency conversion

`@eristack/money` does **not** fetch market rates. Your application owns rate sources (treasury table, bank feed, manual entry).

## Convert with a rate

```ts
import { Conversion, Money } from "@eristack/money";

const usd = Money.of("100.00", "USD");
const idr = usd.with(
  Conversion.of({
    base: "USD",
    term: "IDR",
    factor: "15000",
    timestamp: new Date("2026-01-15"),
  }),
);
// 1500000 IDR (rounded to IDR scale)
```

`factor` means: `term = base * factor`.

## Notes

- Base currency on the amount must match `rate.base`
- Result is rounded to the term currency's default fraction digits (`HALF_EVEN` by default)
- Pass `RoundingMode` as the second argument to `Conversion.of` when needed
