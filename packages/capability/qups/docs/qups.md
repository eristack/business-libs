---
title: QUPS
description: Quantity, unit price, subtotal — exactly 2-of-3 sources of truth
sidebar_position: 5
---

# QUPS

QUPS is the **quantity / unit price / subtotal** triad. Exactly **two** fields are
sources of truth; the third is derived. That keeps forms, BE inserts, and
ledger math from inventing floating quantities.

Prefer **`calculateLine` / `patchLine`** for everyday work (plain strings). Use
the `Qups` class when you already hold `Money` values.

## Truth modes

| `truth` | Sources | Derived |
| --- | --- | --- |
| `quantity+unitPrice` | qty, unit | `subtotal = qty × unitPrice` |
| `quantity+subtotal` | qty, sub | `unitPrice = subtotal ÷ qty` |
| `unitPrice+subtotal` | unit, sub | `quantity = subtotal ÷ unitPrice` as **ratio** |

```text
        quantity ──┐
                   ├──► product() uses SoT only (never drift)
     unitPrice ────┤
                   │
      subtotal ────┘
         ▲
         │  exactly two of these are "source"
```

## Exact ratio for U+S

When unit price and subtotal are SoT, quantity may not be a clean decimal
(`10 ÷ 3`). QUPS stores:

```ts
quantityRatio: { numerator: "10", denominator: "3" }
```

Display can show a rounded qty; **math** multiplies with the ratio so
`product()` stays exact.

```ts
import { Money } from "@eristack/money";
import { Qups } from "@eristack/qups";

const line = Qups.of({
  truth: "unitPrice+subtotal",
  unitPrice: Money.of("3", "USD"),
  subtotal: Money.of("10", "USD"),
});

line.quantityRatio; // { numerator: "10", denominator: "3" }
line.product(); // Money 10 USD — SoT product, not float × unit
```

## Editing

`edit` / `patchLine` re-anchor which fields stay SoT:

| User changes | Typical new truth |
| --- | --- |
| qty (had Q+U) | stay `quantity+unitPrice`, recompute sub |
| unit (had Q+U) | stay `quantity+unitPrice`, recompute sub |
| sub (had Q+U) | often switch to `quantity+subtotal` or keep policy in your form |
| unit on U+S line | stay `unitPrice+subtotal`, ratio updates |

Form listeners should call the same function the BE will call on insert — see
[Form & backend](./form-and-be.md).

## Roles

`calculateLine` returns `roles` for each triad member:

| Role | Meaning |
| --- | --- |
| `source` | Participates in SoT |
| `derived` | Computed from the other two |

Use roles to style inputs (SoT fields editable; derived read-only) without
duplicating truth rules in the UI.

## Rounding

Pass `round: true` (or Money rounding options on class APIs) at **ledger
boundaries** — after the line is ready to persist — not on every keystroke
unless your UX requires it.

## Pipeline position

```text
QUPS triad  →  modifiers (discount/surcharge)  →  tax  →  payable total
```

`PricingLine` / `calculateLine` run that stack. See [Modifiers](./modifiers.md)
and [Tax](./tax.md).

## Anti-patterns

| Do not | Do instead |
| --- | --- |
| `qty * unit` with JS `number` | `calculateLine` / `Money` |
| Persist a float qty for U+S | Persist ratio columns + SoT |
| Different math in form vs BE | Share `calculateLine` / `patchLine` |
| Three independent editable fields | Exactly two SoT; derive the third |
