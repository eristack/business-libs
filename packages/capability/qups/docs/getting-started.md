---
title: Getting started
description: Install @eristack/qups and calculate your first pricing line
sidebar_position: 2
---

# Getting started

This guide gets you from `pnpm add` to a full line snapshot (QUPS → modifiers → tax) with plain strings — the same shape you will put in a form and insert on the server.

## Installation

```bash
pnpm add @eristack/qups @eristack/money
```

| Entry | Peer you must already have |
| --- | --- |
| `@eristack/qups` | `@eristack/money` |
| `@eristack/qups/drizzle` | `drizzle-orm` + your driver |

## First line

```ts
import { calculateLine } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50.00",
  taxRatePercent: "11",
  round: true,
});

line.subtotal; // "100"
line.taxAmount; // tax on net
line.total; // payable gross
line.roles; // quantity/unit_price source, subtotal derived
```

`round: true` applies `Rounding.currencyDefault()` from `@eristack/money` before snapshotting — typical before display or persist.

## Add a discount

```ts
const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

line.discountTotal;
line.net; // after modifiers
line.total; // after tax
```

Modifier order matters: each step sees the previous running total. Details in [Modifiers](./modifiers.md).

## Patch on edit

```ts
import { calculateLine, patchLine } from "@eristack/qups";

let line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  round: true,
});

line = patchLine(line, { unitPrice: "55" });
// quantity stays 2; subtotal and totals recompute
```

Use `patchLine` in form listeners; call `calculateLine` once more on submit if you want a clean server-side recompute from the posted SoT fields.

## Persist with optional columns

```ts
import { withQupsColumns } from "@eristack/qups";
import { qupsLineColumns } from "@eristack/qups/drizzle";

// schema once:
// pgTable("invoice_lines", { …, ...qupsLineColumns("pgsql") })

await db.insert(invoiceLines).values(
  withQupsColumns({ id, invoiceId, itemId: "SKU-1" }, line),
);
```

You do **not** need Drizzle to calculate — only to inject typed columns. See [Stores & Drizzle](./stores.md).

## Rules of thumb

1. Prefer **`calculateLine` / `patchLine`** at form and HTTP boundaries (plain strings).
2. Keep **`truth`** explicit; disable derived fields via `line.roles`.
3. Construct money with **strings** (`"50.00"`), not `50.00` as a JS number.
4. Set **`round: true`** (or round in domain) before persist/display.
5. Recompute on the **backend** before insert — never trust client totals alone.

## Next steps

- [Concepts](./concepts.md) — 2-of-3 SoT and layers
- [Form & backend](./form-and-be.md) — TanStack Form wiring
- [Recipes](./recipes.md) — copy-paste patterns
