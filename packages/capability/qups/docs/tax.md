---
title: Tax
description: Exclusive and inclusive tax triads
sidebar_position: 5
---

# Tax

`LineTax` uses `@eristack/money` Tax operators.

| `truth` | Result |
| --- | --- |
| `net+rate` | exclusive: tax + gross from net |
| `gross+rate` | inclusive: split net + tax from gross |
| `net+tax` | gross = net + tax |

Round with `withRounding(Rounding.currencyDefault())` at ledger boundaries.
