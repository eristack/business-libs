---
title: Concepts
description: Two-of-three SoT, Money, layers, roles, and the form/BE boundary
sidebar_position: 3
---

# Concepts

Five ideas explain almost every API decision in `@eristack/qups`: exactly two of three are authoritative, money never uses JS floats, the pipeline is layered, roles drive the UI, and the same plain-string snapshot crosses the form/BE boundary.

## Two of three (source of truth)

In the tightly coupled triad **quantity · unit price · subtotal**, exactly **two** values are authoritative; the third is **derived**. That prevents float loss: if subtotal is `10` and unit price is `3`, the true quantity is `10/3`, not a rounded `3.33` that no longer multiplies back to `10`.

| `truth` | Sources of truth | Derived |
| --- | --- | --- |
| `quantity+unitPrice` | quantity, unitPrice | subtotal = qty × unitPrice |
| `quantity+subtotal` | quantity, subtotal | unitPrice = subtotal ÷ qty |
| `unitPrice+subtotal` | unitPrice, subtotal | quantity (kept as **ratio** when needed) |

```text
quantity+unitPrice     quantity+subtotal     unitPrice+subtotal
   Q ●  UP ●              Q ●  S ●              UP ●  S ●
        S ○                    UP ○                  Q ○ (ratio)
```

`●` = source · `○` = derived

When truth is `unitPrice+subtotal`, `quantityRatio` holds `{ numerator, denominator }` as decimal strings. Prefer that over trusting a rounded `quantity` string for ledger identity. `product()` / recalculation always uses the SoT pair so the line cannot drift.

Switching truth with `asTruth` / `patchLine({ truth })` re-labels which pair is authoritative without inventing a fourth mode. See [QUPS](./qups.md).

## Money only for currency

Unit price, subtotals, discounts, tax, net, and gross are [`@eristack/money`](/docs/money) amounts (string or minor-unit constructors under the hood). Quantity is **dimensionless** — a decimal string plus optional exact ratio.

```ts
import { Money } from "@eristack/money";
import { Qups } from "@eristack/qups";

Qups.of({
  truth: "unitPrice+subtotal",
  unitPrice: Money.of("3", "USD"),
  subtotal: Money.of("10", "USD"),
});
// quantityRatio → { numerator: "10", denominator: "3" }
```

`calculateLine` accepts plain strings and constructs `Money` internally so TanStack Form and HTTP bodies never need Money objects.

## Three layers, one direction

```text
1. QUPS          qty · unit price · subtotal
2. Adjusted      base (QUPS subtotal) ± ordered modifiers → net
3. Tax           exclusive (net+rate) or inclusive (gross+rate) → payable total
```

Modifiers never rewrite the QUPS SoT; they consume subtotal as base. Tax consumes adjusted net (or treats it as inclusive gross when `taxMode: "inclusive"`). Rounding with `round: true` / `withRounding(Rounding.currencyDefault())` belongs at **display and persist** boundaries — same rule as money docs.

## Roles: editable vs derived

`CalculatedLine.roles` (and `qupsRolesFor`) tells the UI which QUPS fields to enable:

## Truth mode registry

Import the runtime tuple — do not copy the three strings in app code:

```ts
import { QUPS_TRUTH_MODES, isQupsTruthMode } from "@eristack/qups";

QUPS_TRUTH_MODES; // readonly ["quantity+unitPrice", "quantity+subtotal", "unitPrice+subtotal"]
isQupsTruthMode(draft.truth); // narrows wire input for selects / parsers
```

Use `qupsRolesFor(truth)` for which fields are sources vs derived — not hand-rolled `needsQty` flags.

```ts
// truth: "quantity+unitPrice"
roles = {
  quantity: "source",
  unit_price: "source",
  subtotal: "derived",
};
```

Bind `readOnly` / `disabled` from `roles`. Editing a derived field without changing truth is the wrong mental model — either change truth, or edit a source and let derivation run.

## Plain snapshot for forms and BE

`calculateLine` / `patchLine` return a flat `CalculatedLine`: all money and qty as decimal strings, plus `modifiers`, `roles`, and `columns`.

| Consumer | Uses |
| --- | --- |
| TanStack Form | Field values + `roles` + `patchLine` on change |
| API / BE | Same snapshot → validate → persist |
| Drizzle insert | `withQupsColumns(row, line)` or spread `line.columns` |

There is no separate “form DTO” and “DB DTO”. The snapshot *is* the boundary. Lower-level `PricingLine` is for domain code that already holds `Money`; prefer the string API at HTTP and form edges.

## Edit rules (`patchLine` / `Qups.edit`)

Patching one SoT field recomputes the derived member under the current truth. When only `subtotal` changes, `prefer: "quantity" | "unitPrice"` picks which partner stays fixed (same as `Qups.edit`). Changing `truth` relabels sources; changing modifiers/tax without touching Q/UP/S recalculates the adjusted + tax layers only.

## Errors and invariants

| Rule | Behavior |
| --- | --- |
| Wrong pair for `truth` | Throws (e.g. `quantity+unitPrice` without both fields) |
| Mixed currencies on a line | `CurrencyMismatchError` via Money |
| Zero quantity where division needed | `InvalidTruthError` |
| Unknown / empty quantity string | `InvalidTruthError` |

Adapters do not invent a second validation language — fail in core, map at HTTP if you wrap it.

## Where to go next

- [Getting started](./getting-started.md) — install and first line
- [Form & backend](./form-and-be.md) — TanStack Form + insert lifecycle
- [QUPS](./qups.md) / [Modifiers](./modifiers.md) / [Tax](./tax.md) — each layer in detail
