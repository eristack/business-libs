---
title: Recipes
description: End-to-end patterns for forms, BE, tax modes, and Drizzle
sidebar_position: 9
---

# Recipes

Copy these patterns instead of inventing float math in React or SQL.

## Invoice line — qty × price + percent discount + exclusive tax

```ts
import { calculateLine, withQupsColumns } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50.00",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  taxMode: "exclusive",
  round: true,
});

await db.insert(invoiceLines).values(
  withQupsColumns({ invoiceId: "inv_1", itemId: "SKU-1" }, line),
);
```

## Quote line — user enters line amount (quantity + subtotal)

```ts
const line = calculateLine({
  truth: "quantity+subtotal",
  currency: "USD",
  quantity: "4",
  subtotal: "100.00",
  round: true,
});
// unitPrice derived = 25.00
```

Form: enable quantity + subtotal; disable unit price via `line.roles`.

## Catch-weight / uneven division (unitPrice + subtotal)

```ts
const line = calculateLine({
  truth: "unitPrice+subtotal",
  currency: "USD",
  unitPrice: "3",
  subtotal: "10",
  round: true,
});

line.quantityRatio; // { numerator: "10", denominator: "3" }
// Persist ratio columns if you need exact qty later
```

## TanStack Form — patch on change, recalculate on submit

```ts
import { calculateLine, patchLine } from "@eristack/qups";

// onChange of unit price:
const next = patchLine(
  {
    truth: "quantity+unitPrice",
    currency: "USD",
    quantity: form.getFieldValue("quantity"),
    unitPrice: form.getFieldValue("unitPrice"),
    taxRatePercent: form.getFieldValue("taxRatePercent"),
    round: true,
  },
  { unitPrice: newValue },
);

form.setFieldValue("unitPrice", next.unitPrice);
form.setFieldValue("subtotal", next.subtotal);
form.setFieldValue("total", next.total);

// onSubmit (client or server):
const line = calculateLine({
  truth: form.getFieldValue("truth"),
  currency: form.getFieldValue("currency"),
  quantity: form.getFieldValue("quantity"),
  unitPrice: form.getFieldValue("unitPrice"),
  taxRatePercent: form.getFieldValue("taxRatePercent"),
  modifiers: form.getFieldValue("modifiers"),
  round: true,
});
```

Full lifecycle: [Form & backend](./form-and-be.md).

## Switch pricing mode in the UI

```ts
const next = patchLine(current, { truth: "quantity+subtotal" });
// roles flip: unit_price becomes derived
form.setFieldValue("roles", next.roles);
form.setFieldValue("unitPrice", next.unitPrice);
form.setFieldValue("subtotal", next.subtotal);
```

## Inclusive tax (gross contains tax)

```ts
const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "1",
  unitPrice: "110",
  taxRatePercent: "10",
  taxMode: "inclusive",
  round: true,
});
// adjusted net treated as inclusive gross → split net + tax
```

See [Tax](./tax.md).

## Stacked modifiers (percent then nominal)

```ts
calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "1",
  unitPrice: "100",
  modifiers: [
    { kind: "discount", type: "percent", percent: "10" },
    { kind: "surcharge", type: "nominal", amount: "5" },
  ],
  round: true,
});
// 100 → 90 → 95 net (order is load-bearing)
```

## Document header total from lines

```ts
import { Money } from "@eristack/money";

const lines = items.map((item) =>
  calculateLine({ ...item, round: true }),
);

const headerTotal = Money.sum(
  lines.map((l) => Money.of(l.total, l.currency)),
);
```

Sum **after** per-line rounding if that is your ledger rule; document the choice.

## Drizzle detail table

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { qupsLineColumns } from "@eristack/qups/drizzle";

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  itemId: text("item_id").notNull(),
  ...qupsLineColumns("pgsql"),
});
```

Dialect name is **`"pgsql"`**, not `"pg"`. See [Stores & Drizzle](./stores.md).

## Lower-level PricingLine in domain services

```ts
import { Money } from "@eristack/money";
import { PricingLine } from "@eristack/qups";

PricingLine.of({
  qups: {
    truth: "quantity+unitPrice",
    quantity: "2",
    unitPrice: Money.of("50", "USD"),
  },
  tax: { ratePercent: "11" },
}).withRounding();
```

Prefer `calculateLine` for forms/HTTP; use `PricingLine` when you already work in Money.

## BE rejects client-only total

```ts
const recomputed = calculateLine({
  truth: body.truth,
  currency: body.currency,
  quantity: body.quantity,
  unitPrice: body.unitPrice,
  modifiers: body.modifiers,
  taxRatePercent: body.taxRatePercent,
  round: true,
});

if (body.total != null && body.total !== recomputed.total) {
  throw new Error("Line total mismatch"); // or soft-correct to recomputed
}
```
