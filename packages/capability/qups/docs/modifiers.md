---
title: Modifiers
description: Discounts and surcharges with two sources of truth
sidebar_position: 4
---

# Modifiers

`AdjustedAmount` applies an ordered list of discounts/surcharges to a base
(usually QUPS subtotal).

| Spec | Meaning |
| --- | --- |
| `{ kind: "discount", type: "percent", percent: "10" }` | −10% |
| `{ kind: "surcharge", type: "nominal", amount }` | +Money |

Truth modes:

| `truth` | Meaning |
| --- | --- |
| `base+modifiers` | Apply list → net |
| `base+net` | Derive a single nominal discount/surcharge |
| `modifiers+net` | Reverse modifiers to recover base |

Multiple modifiers stack in order (each step sees the previous running total).
