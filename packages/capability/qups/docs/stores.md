---
title: Stores & Drizzle
description: Optional injectable columns — calculateLine is the main API
sidebar_position: 6
---

# Stores & Drizzle

Most apps only need **`calculateLine` / `patchLine` / `withQupsColumns`** from
`@eristack/qups` (forms + BE). Persistence is optional.

## Injectable columns

Spread QUPS pricing columns into **your** detail table:

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { qupsLineColumns } from "@eristack/qups/drizzle";
import { calculateLine, withQupsColumns } from "@eristack/qups";

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  itemId: text("item_id").notNull(),
  ...qupsLineColumns("pgsql"),
});

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  round: true,
});

await db.insert(invoiceLines).values(
  withQupsColumns({ id, invoiceId, itemId: "SKU-1" }, line),
);
```

`line.columns` already matches the injectable property names
(`currencyUnitPrice`, `unitPrice`, …).

## Optional stores

`createQups` + profile/line stores exist for apps that want a catalog of field
defs or a shared line repository. They are **not** required for form/BE calc.
See skills `qups-adapters` if you need them.
