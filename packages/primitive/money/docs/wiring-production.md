---
title: Production wiring
description: End-to-end SQL + HTTP + React path for money amounts
sidebar_position: 3
---

# Production wiring — `@eristack/money`

Complete path from string-first amounts in domain code to Postgres columns, API JSON, Express validation, and React forms. **Never use JS number literals for currency.**

Skills: `@eristack/money#money-amounts`, `@eristack/money#money-ledger`.

---

## Install and peers

```bash
pnpm add @eristack/money
pnpm add drizzle-orm postgres   # when persisting
pnpm add zod                     # optional: @eristack/money/zod
pnpm add express                 # optional: HTTP helpers
```

| Entry | Peer |
| --- | --- |
| `@eristack/money` | — |
| `@eristack/money/drizzle` | `drizzle-orm` |
| `@eristack/money/rest` | — |
| `@eristack/money/zod` | `zod` (^4) |
| `@eristack/money/express` | `express` |
| `@eristack/money/nest` | `@nestjs/common` |
| `@eristack/money/react` | `react`, `@tanstack/react-form` |

Hub overview: [Adapters](./adapters.md).

---

## 1. Domain layer (framework-free)

```ts
import { Discount, Money, Rounding, Tax } from "@eristack/money";

const round = Rounding.currencyDefault();

export function calculateInvoiceLine(input: {
  qty: string;
  unitPrice: string;
  currency: string;
  discountPercent: string;
  taxPercent: string;
}) {
  const line = Money.of(input.unitPrice, input.currency).times(input.qty);
  const net = line.with(Discount.ofPercent(input.discountPercent)).with(round);
  const tax = net.with(Tax.onExclusive(input.taxPercent)).with(round);
  const total = Money.sum([net, tax]).with(round);
  return { net, tax, total };
}
```

Rules:

1. Construct with **strings** or minor-unit integers
2. Round with `Rounding.currencyDefault()` at persist/display boundaries
3. FX rates live in your app — pass into `Conversion.of(rate, …)`

---

## 2. Drizzle columns (Postgres)

Amount-only lines with shared document currency:

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { Money, Rounding } from "@eristack/money";
import { moneyCurrencyField, moneyField } from "@eristack/money/drizzle";

const currency = moneyCurrencyField("pgsql", "currency");
const unitPrice = moneyField("pgsql", "unitPrice", { mode: "amountOnly" });
const lineTotal = moneyField("pgsql", "lineTotal", { mode: "amountOnly" });

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  ...currency.columns,
  ...unitPrice.columns,
  ...lineTotal.columns,
});

// Insert
await db.insert(invoiceLines).values({
  id,
  invoiceId,
  ...currency.pack("USD"),
  ...unitPrice.pack(Money.of("120.00", "USD")),
  ...lineTotal.pack(total.with(Rounding.currencyDefault())),
});

// Select → Money
const row = await db.query.invoiceLines.findFirst({ where: eq(invoiceLines.id, id) });
const price = unitPrice.unpack(row);
```

Paired amount+currency per field when line currency varies: `moneyField("pgsql", "charge", { mode: "paired" })`.

Production dialect: **`"pgsql"`**. SQLite text columns for local Vitest only.

---

## 3. Wire format (REST / JSON)

```ts
import { moneyToJSON, MoneyJSON } from "@eristack/money";

const body: { total: MoneyJSON } = {
  total: moneyToJSON(Money.of("1234.50", "USD")),
};
// { currency: "USD", amount: "1234.50" }
```

Validate inbound bodies:

```ts
import { zMoneyJSON } from "@eristack/money/zod";

const CreateLine = z.object({
  unitPrice: zMoneyJSON(),
});
```

---

## 4. Express handlers

```ts
import {
  readMoney,
  sendMoney,
  RestMoneyFieldError,
} from "@eristack/money/express";

app.post("/lines", (req, res) => {
  try {
    const unitPrice = readMoney(req.body.unitPrice, "unitPrice");
    const qty = String(req.body.qty);
    const total = unitPrice.times(qty).with(Rounding.currencyDefault());
    res.json({ total: sendMoney(total) });
  } catch (error) {
    if (error instanceof RestMoneyFieldError) {
      return res.status(400).json({ issues: error.issues });
    }
    throw error;
  }
});
```

---

## 5. React forms (TanStack Form)

```tsx
import { createMoneyFieldValidators } from "@eristack/money/react";

const validators = createMoneyFieldValidators({ currency: "USD" });

<form.Field
  name="unitPrice"
  validators={validators}
  children={(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

Keep form state as **decimal strings**; convert to `Money` only in submit handler.

---

## 6. Data-grid decimal columns

When lists sort/filter money as strings:

```ts
{ name: "totalAmount", type: "decimal", filterable: true, sortable: true }
```

Grid compares decimal strings — do not `Number()` money columns. Typed compare in app code uses `@eristack/money` directly.

---

## 7. QUPS integration

Line math defers to `@eristack/qups` for 2-of-3 pricing; money supplies `Money` operators inside qups. Persist qups columns via `@eristack/qups/drizzle` — amounts still string-first.

---

## 8. Testing note

Core money tests need no DB. Adapter tests:

```ts
// Vitest + better-sqlite3
moneyField("sqlite", "amount", { mode: "amountOnly" });
```

No `@eristack/money/testing` subpath yet — use drizzle sqlite in package tests. **Do not** round-trip through `Number()` in tests.

---

## 9. Production checklist

- [ ] All API money fields are `{ currency, amount }` strings
- [ ] DB columns use `numeric`/`decimal` string mode (pgsql)
- [ ] Rounding at invoice post / GL boundary, not per cell keystroke
- [ ] FX table owned by app; `Conversion.of` at report time
- [ ] OpenAPI documents MoneyJSON if you publish schemas

---

## Related

- [Getting started](./getting-started.md) — first amounts
- [Drizzle](./drizzle.md) — field modes
- [REST](./rest.md) / [Zod](./zod.md) — wire validation
- [Advanced arithmetic](./advanced-arithmetic.md) — tax, allocate, FX
