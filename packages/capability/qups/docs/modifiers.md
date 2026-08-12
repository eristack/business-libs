---
title: Modifiers
description: Stacked discounts and surcharges on the QUPS subtotal
sidebar_position: 6
---

# Modifiers

After the QUPS triad yields a **subtotal**, modifiers adjust it into a **net**
(before tax). Specs are ordered; each step sees the previous running total.

## Spec shapes

| Spec | Effect |
| --- | --- |
| `{ kind: "discount", type: "percent", percent: "10" }` | −10% of current |
| `{ kind: "discount", type: "nominal", amount: "5" }` | −5 (same currency) |
| `{ kind: "surcharge", type: "percent", percent: "2" }` | +2% of current |
| `{ kind: "surcharge", type: "nominal", amount: "1.50" }` | +1.50 |

String amounts match form/BE conventions (`calculateLine`). Class APIs take
`Money` via `AdjustedAmount`.

## Truth modes (`AdjustedAmount`)

| `truth` | Meaning |
| --- | --- |
| `base+modifiers` | Apply list → net (usual form path) |
| `base+net` | Derive a single nominal discount/surcharge that bridges base→net |
| `modifiers+net` | Reverse the stack to recover base |

Everyday line calc uses **`base+modifiers`**.

## Stacking order

```text
subtotal (QUPS)
   │  −10% discount
   ▼
  90
   │  +2 nominal surcharge
   ▼
  92  ← net into tax
```

Order is part of the contract. A 10% then nominal ≠ nominal then 10%. Persist
the ordered list (or a canonical profile id), not only the final net.

## With calculateLine

```ts
import { calculateLine, patchLine } from "@eristack/qups";

const base = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  round: true,
});

const discounted = patchLine(base, {
  modifiers: [
    { kind: "discount", type: "percent", percent: "10" },
    { kind: "surcharge", type: "nominal", amount: "2" },
  ],
  round: true,
});

discounted.subtotal; // "100"
discounted.discountTotal; // from stack
discounted.net; // after modifiers
```

## UI patterns

- Show each modifier as a row; recompute with `patchLine` on change.
- Keep QUPS SoT fields separate from modifier editors.
- Document-level discounts are **app** concerns — QUPS modifiers are
  **line-local** unless you feed a pre-allocated line share.

## Gotchas

| Pitfall | Fix |
| --- | --- |
| Percent of tax-inclusive price | Apply modifiers on QUPS subtotal / net **before** exclusive tax |
| Mixing currencies in nominal specs | Same currency as the line |
| Empty modifiers | Net equals subtotal |
| Reordering silently | Treat order as user-visible / audited |

## Next

- [Tax](./tax.md) — exclusive / inclusive after net
- [Form & backend](./form-and-be.md)
- [Recipes](./recipes.md)
