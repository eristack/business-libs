---
title: Recipes
description: TanStack Form recalculation and BE insert
sidebar_position: 7
---

# Recipes

## Calculate once (form or BE)

```ts
import { calculateLine, withQupsColumns } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50.00",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

line.subtotal; // derived
line.total;    // payable gross
line.roles;    // which fields are editable vs derived

await db.insert(invoiceLines).values(
  withQupsColumns({ invoiceId: "inv_1", itemId: "SKU-1" }, line),
);
```

## TanStack Form — patch on change

Keep SoT fields in the form. On change of a source field, `patchLine` and write
derived values back (`subtotal`, `total`, …). Use `line.roles` to disable derived inputs.

```ts
import { calculateLine, patchLine } from "@eristack/qups";

// after user edits unit price:
const next = patchLine(
  {
    truth: "quantity+unitPrice",
    currency: "USD",
    quantity: form.getFieldValue("quantity"),
    unitPrice: form.getFieldValue("unitPrice"),
    round: true,
  },
  { unitPrice: newValue },
);

form.setFieldValue("unitPrice", next.unitPrice);
form.setFieldValue("subtotal", next.subtotal);
form.setFieldValue("total", next.total);
```

On submit, call `calculateLine` once more (or reuse the latest snapshot) and
`withQupsColumns({ itemId }, line)` for the API/DB payload.

## Lower-level classes (optional)

When you already have `Money` instances in domain code:

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
});
```

Prefer `calculateLine` / `patchLine` for forms and HTTP boundaries.

## Drizzle columns (optional)

```ts
import { qupsLineColumns } from "@eristack/qups/drizzle";

pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  ...qupsLineColumns("pgsql"),
});
```

See [Stores & Drizzle](./stores.md).
