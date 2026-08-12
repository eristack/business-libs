---
title: Rounding
description: Rounding modes and currency-default rounding for ledgers
sidebar_position: 7
---

# Rounding

## Currency default

Most ERP paths should round to the currency's default fraction digits before posting:

```ts
import { Money, Rounding } from "@eristack/money";

const raw = Money.of("19.99", "USD").multiply("0.07"); // 1.3993
const tax = raw.with(Rounding.currencyDefault()); // 1.40
```

Default mode is **HALF_EVEN** (banker's rounding), which reduces cumulative bias in ledgers.

## Explicit scale and mode

```ts
amount.roundTo(2, "HALF_UP");
amount.with(Rounding.of(0, "DOWN"));
```

Supported modes: `UP`, `DOWN`, `CEILING`, `FLOOR`, `HALF_UP`, `HALF_DOWN`, `HALF_EVEN`, `UNNECESSARY`.

`UNNECESSARY` throws if any rounding would be required.

## Ledger guidance

| Context | Suggested mode |
| --- | --- |
| General ledger / subledger posting | `HALF_EVEN` |
| Customer-facing price display (local rules) | Often `HALF_UP` |
| Tax authority rules | Follow jurisdiction; do not assume |

Always document which mode your product uses at each boundary.
