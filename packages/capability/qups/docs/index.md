---
title: Overview
description: Line pricing calculator for forms and the business layer
sidebar_position: 1
---

# @eristack/qups

Every invoice, order, quote, and goods-receipt line eventually asks the same question: given quantity, unit price, and subtotal — plus discounts and tax — what are the derived numbers? Most codebases answer it with float math in React, a second formula in the API, and a third in SQL. Those copies drift.

`@eristack/qups` is the **business calculator** for that line. One function recalculates on TanStack Form change and again on the backend before insert. Money fields go through [`@eristack/money`](/docs/money). Quantity that cannot be represented as a clean decimal stays as an exact ratio.

## When to use it

Use this package when you need:

- A single recalculation path for **forms and BE** (`calculateLine` / `patchLine`)
- **Two-of-three** source of truth for qty · unit price · subtotal (no float loss on `10 ÷ 3`)
- Ordered **discounts / surcharges**, then **exclusive or inclusive tax**
- Optional Drizzle **column injection** into *your* detail table (`itemId` + pricing columns)
- A lower-level `PricingLine` / `Qups` API when you already hold `Money` instances

## What it is not

| Not this | Because |
| --- | --- |
| An invoice UI | Headless strings and Money — you own inputs and tables |
| A tax engine with jurisdiction tables | You pass `taxRatePercent` / mode; rates come from your catalog |
| A second money library | Currency math is `@eristack/money` |
| A required ORM | Drizzle columns are optional; most apps stop at `withQupsColumns` |

## Layers

```text
@eristack/qups                         core — calculateLine / patchLine / Qups / PricingLine
        │
        └── /drizzle                   qupsLineColumns + optional profile/line stores
```

```text
QUPS (qty · unit price · subtotal)     ← exactly two are SoT
   │
   ▼
Adjusted (base ± modifiers → net)
   │
   ▼
Tax (net/gross + rate → payable total)
```

## A minute of code

```ts
import { calculateLine, patchLine, withQupsColumns } from "@eristack/qups";

let line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

line = patchLine(line, { unitPrice: "55" }); // form onChange

await db.insert(invoiceLines).values(
  withQupsColumns({ invoiceId, itemId: "SKU-1" }, line),
);
```

| Field on `CalculatedLine` | Role |
| --- | --- |
| `quantity` / `unitPrice` / `subtotal` | Decimal strings for form state |
| `roles` | Which QUPS fields are editable vs derived |
| `net` / `taxAmount` / `total` | After modifiers + tax |
| `columns` | Keys matching injectable Drizzle properties |

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Getting started](./getting-started.md) | Install + first `calculateLine` |
| [Concepts](./concepts.md) | 2-of-3 SoT, Money, layers, roles |
| [Form & backend](./form-and-be.md) | TanStack Form + BE insert lifecycle |
| [QUPS](./qups.md) | Truth modes and ratio quantity |
| [Modifiers](./modifiers.md) | Discounts and surcharges |
| [Tax](./tax.md) | Exclusive / inclusive triads |
| [Stores & Drizzle](./stores.md) | Injectable columns and optional stores |
| [Recipes](./recipes.md) | End-to-end patterns to copy |

## Related packages

- [`@eristack/money`](/docs/money) — all currency amounts
- [`@eristack/doc-number`](/docs/doc-number) — document numbers on the header, not the line
