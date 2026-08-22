---
name: qups-adapters
description: >
  Optional @eristack/qups/drizzle: qupsLineColumns injected into app detail
  tables; withQupsColumns from calculateLine for inserts. Profile/line stores
  only if you need a field catalog — everyday form/BE math uses calculateLine.
metadata:
  type: adapter
  library: '@eristack/qups'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/capability/qups/docs/stores.md'
  - 'eristack/business-libs:packages/capability/qups/src/drizzle/line-columns.ts'
---

# @eristack/qups — Adapters (optional)

Prefer `calculateLine` / `patchLine` / `withQupsColumns` from the main package.

Injectable columns use **one shared `currency`** plus `@eristack/money/drizzle`
amount columns (`unitPriceAmount` → SQL `unit_price_amount`, …). No per-field
`currency_*` duplicates.

```ts
import { calculateLine, withQupsColumns } from "@eristack/qups";
import { qupsLineColumns } from "@eristack/qups/drizzle";

const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  ...qupsLineColumns("pgsql"),
});

const line = calculateLine({ truth: "quantity+unitPrice", currency: "USD", quantity: "2", unitPrice: "50", round: true });
await db.insert(invoiceLines).values(withQupsColumns({ id, itemId: "SKU-1" }, line));
```
