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

`withQupsColumns` merges app keys (`itemId`, FKs) with `line.columns` from
`calculateLine` (or a bare `QupsColumnValues` object).

## Column layout (Postgres)

One shared **`currency`** plus numeric amount columns via
`@eristack/money/drizzle` defaults. QUPS-specific columns (truth, quantity,
tax rate) stay as text.

| JS property (`qupsLineColumns`) | SQL column | Type (pgsql) | Notes |
| --- | --- | --- | --- |
| `profileId` | `profile_id` | text | optional (`includeProfileId: false` to omit) |
| `truth` | `truth` | text | `quantity+unitPrice`, etc. |
| `quantity` | `quantity` | text | dimensionless decimal string |
| `quantityRatioNumerator` | `quantity_ratio_numerator` | text | optional exact ratio |
| `quantityRatioDenominator` | `quantity_ratio_denominator` | text | optional exact ratio |
| `currency` | `currency` | varchar(16) | **shared** ISO code for all money on the row |
| `unitPriceAmount` | `unit_price_amount` | numeric | unit price magnitude |
| `subtotalAmount` | `subtotal_amount` | numeric | subtotal magnitude |
| `taxRatePercent` | `tax_rate_percent` | text | optional |
| `taxMode` | `tax_mode` | text | `exclusive` \| `inclusive` |
| `taxAmount` | `tax_amount` | numeric | derived tax |
| `netAmount` | `net_amount` | numeric | after modifiers, before tax |
| `grossAmount` | `gross_amount` | numeric | line total (incl. tax) |

Canonical SQL name list: `QUPS_LINE_SQL_COLUMNS` export from `@eristack/qups/drizzle`.

### Form / BE vs SQL

| Layer | Shape |
| --- | --- |
| `calculateLine` / TanStack Form | Flat strings: `currency: "USD"`, `unitPrice: "50"`, `subtotal: "100"` |
| `line.columns` / `withQupsColumns` | Drizzle keys: `currency`, `unitPriceAmount`, `subtotalAmount`, … |
| HTTP wire (optional) | Nested `MoneyJSON` per field via `@eristack/money/rest` |

`moneyColumnPair("unit_price")` → `{ amount: "unit_price_amount", currency: "currency" }` for UI/adapters.

## Migration from legacy columns

Breaking change for apps that spread an older `qupsLineColumns` with per-field
`currency_*` TEXT columns.

**Profile-driven columns:** `qupsLineColumnsFromProfile("pgsql", { trackPosition: true })` maps storage hints to `qupsLineColumns` options.

| Old SQL | New SQL |
| --- | --- |
| `currency_unit_price`, `currency_subtotal`, `currency_tax`, … | `currency` (one column; verify old values matched) |
| `unit_price` TEXT | `unit_price_amount` NUMERIC |
| `subtotal` TEXT | `subtotal_amount` NUMERIC |
| `tax_amount` TEXT | `tax_amount` NUMERIC (unchanged SQL name; type numeric) |
| `net` TEXT | `net_amount` NUMERIC |
| `gross` TEXT | `gross_amount` NUMERIC |

For gradual migration of **custom** money fields (not the built-in QUPS spread),
use `@eristack/money/drizzle` `moneyNamingPresets.legacyQups` — see
[@eristack/money Drizzle adapter](/docs/money/drizzle).

## What gets stored

| Concern | Persist |
| --- | --- |
| SoT mode | `truth` |
| Triad | `quantity` or ratio columns; amounts in `*Amount` columns |
| Modifiers | side table or JSON per your store adapter |
| Tax | `taxRatePercent`, `taxMode`, `taxAmount`, `grossAmount` |
| Currency | single `currency` column |

Apps own joins (`invoiceId`, `itemId`). QUPS does not invent a lines table for you.

## Updates

Recompute in the business layer, then write pricing columns only:

```ts
const next = patchLine(previous, { unitPrice: "55", round: true });
await db
  .update(invoiceLines)
  .set(withQupsColumns({}, next))
  .where(eq(invoiceLines.id, id));
```

Do not partially update `subtotalAmount` in SQL while leaving SoT fields stale.

## Optional stores

`createQups` + Drizzle profile/line stores exist for catalogs of field
definitions or shared repositories. They are **not** required for form/BE
calc. Load Intent skill `qups-adapters` when you need them.

`PricingLineRecord` uses the same field names as injectable columns (`currency`,
`unitPriceAmount`, …).

## Testing

- SQLite dialect columns for unit tests; Postgres in prod (`qupsLineColumns("sqlite" | "pgsql")`).
- Assert `withQupsColumns` output keys match your table spread.
- Golden tests: same `calculateLine` input → same persisted snapshot.

## Next

- [Form & backend](./form-and-be.md)
- [Recipes](./recipes.md)
- [@eristack/money Drizzle adapter](/docs/money/drizzle)
- Skill: `qups-adapters`
