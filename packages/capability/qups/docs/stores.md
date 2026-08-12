---
title: Stores & Drizzle
description: Injectable QUPS columns and optional profile/line stores
sidebar_position: 8
---

# Stores & Drizzle

Most apps only need **`calculateLine` / `patchLine` / `withQupsColumns`** from
`@eristack/qups`. Persistence adapters are optional — inject columns into
**your** detail tables instead of owning a separate “QUPS lines” entity.

## Injectable columns

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
  taxRatePercent: "11",
  round: true,
});

await db.insert(invoiceLines).values(
  withQupsColumns({ id, invoiceId, itemId: "SKU-1" }, line),
);
```

`withQupsColumns` merges app keys (`itemId`, FKs) with pricing fields
(`currencyUnitPrice`, `unitPrice`, quantity / ratio, modifiers, tax, …).

## What gets stored

Typical injectable fields (names vary slightly by dialect helper):

| Concern | Persist |
| --- | --- |
| SoT mode | truth / role flags |
| Triad | qty or ratio, unit, subtotal (money strings / minor) |
| Modifiers | ordered list or normalized rows |
| Tax | rate, mode, tax amount, gross |
| Currency | ISO code alongside money columns |

Apps own joins (`invoiceId`, `itemId`). QUPS does not invent a lines table for
you.

## Updates

Recompute in the business layer, then write pricing columns only:

```ts
const next = patchLine(previous, { unitPrice: "55", round: true });
await db
  .update(invoiceLines)
  .set(withQupsColumns({}, next))
  .where(eq(invoiceLines.id, id));
```

Do not partially update `subtotal` in SQL while leaving SoT fields stale.

## Optional stores

`createQups` + Drizzle profile/line stores exist for catalogs of field
definitions or shared repositories. They are **not** required for form/BE
calc. Load Intent skill `qups-adapters` when you need them.

## Testing

- SQLite dialect columns for unit tests; Postgres in prod (`qupsLineColumns("sqlite" | "pgsql")`).
- Assert `withQupsColumns` output keys match your table spread.
- Golden tests: same `calculateLine` input → same persisted snapshot.

## Next

- [Form & backend](./form-and-be.md)
- [Recipes](./recipes.md)
- Skill: `qups-adapters`
