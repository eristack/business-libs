---
title: Drizzle adapter
description: "@eristack/money/drizzle — SQL columns, pack/unpack, naming config"
sidebar_position: 14
---

# Drizzle adapter

`@eristack/money/drizzle` injects money columns into **app-owned** tables (same idea as `@eristack/qups/drizzle` `qupsLineColumns`).

```bash
pnpm add @eristack/money drizzle-orm
```

```ts
import { moneyField, moneyCurrencyField } from "@eristack/money/drizzle";
```

Peer: `drizzle-orm` (optional). Dialect: `"pgsql" | "mysql" | "sqlite"` — production default **`"pgsql"`**.

Overview: [Adapters](./adapters.md).

## Field modes

| Mode | SQL columns | Use |
| --- | --- | --- |
| **Paired** | `{logical}_amount` + `{logical}_currency` | Standalone money (payment in row currency) |
| **Amount only** | `{logical}_amount` | ERP lines with one shared `currency` |
| **Shared currency** | `currency` once per row | Document/line currency for all amount-only fields |

Default suffixes: `_amount` / `_currency`.

| Dialect | Amount | Currency |
| --- | --- | --- |
| `pgsql` | `numeric` `mode: "string"` | `varchar(16)` |
| `mysql` | `decimal(28,8)` `mode: "string"` | `varchar(16)` |
| `sqlite` | `text` | `text` |

SQLite is for unit tests; production = Postgres.

## Prefer `moneyField()` bindings

Bindings tie **columns**, **pack**, **unpack**, and **data-grid field names** to one naming resolution.

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { Money, Rounding } from "@eristack/money";
import {
  moneyCurrencyField,
  moneyField,
} from "@eristack/money/drizzle";

const currency = moneyCurrencyField("pgsql", "currency");
const unitPrice = moneyField("pgsql", "unitPrice", { mode: "amountOnly" });
const subtotal = moneyField("pgsql", "subtotal", { mode: "amountOnly" });

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  ...currency.columns,
  ...unitPrice.columns,
  ...subtotal.columns,
});

const sub = Money.of("100", "USD").with(Rounding.currencyDefault());

await db.insert(invoiceLines).values({
  id: "line_1",
  invoiceId: "inv_1",
  ...currency.pack("USD"),
  ...unitPrice.pack(sub, { expectCurrency: "USD" }),
  ...subtotal.pack(sub, { expectCurrency: "USD" }),
});

const row = await db.query.invoiceLines.findFirst();
subtotal.unpack(row!);
subtotal.gridFields.amount; // "subtotal_amount"
```

Paired field:

```ts
const amount = moneyField("pgsql", "amount", { mode: "paired" });

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  ...amount.columns,
});

await db.insert(payments).values({
  id: "pay_1",
  ...amount.pack(Money.of("19.99", "USD")),
});
```

Low-level column spread:

```ts
import {
  moneyAmountColumn,
  moneyColumns,
  moneyCurrencyColumn,
} from "@eristack/money/drizzle";

pgTable("lines", {
  ...moneyCurrencyColumn("pgsql", "currency"),
  ...moneyAmountColumn("pgsql", "subtotal"),
  ...moneyColumns("pgsql", "fee"),
});
```

## Pack / unpack

```ts
import {
  packMoney,
  unpackMoney,
  packMoneyAmount,
  unpackMoneyAmount,
  packCurrencyCode,
} from "@eristack/money/drizzle";

await db.insert(lines).values({
  ...packCurrencyCode("currency", "USD"),
  ...packMoneyAmount("subtotal", subtotalMoney, { expectCurrency: "USD" }),
});

const money = unpackMoneyAmount("subtotal", row, {
  currency: String(row.currency),
});
```

`PackMoneyOptions`: `expectCurrency`, `naming` (must match column definition).

Throws: `CurrencyMismatchError`, `ParseError` (half-null pair), `UnknownCurrencyError`.

## Naming config

Merge order (most specific wins): per-call → `fields` map → scoped → global → defaults.

```ts
import {
  configureMoneyPersistence,
  createMoneyNamingScopeWithAdapters,
  moneyNamingPresets,
  moneyField,
} from "@eristack/money/drizzle";

configureMoneyPersistence({ naming: moneyNamingPresets.compact });

const invoiceMoney = createMoneyNamingScopeWithAdapters({
  naming: moneyNamingPresets.readable,
});

const legacySubtotal = moneyField("pgsql", "subtotal", {
  mode: "paired",
  naming: moneyNamingPresets.legacyQups,
});
```

| Preset | Effect |
| --- | --- |
| `readable` | Default `_amount` / `_currency` |
| `compact` | `__a` / `__c` |
| `legacyQups` | Old `unit_price` + `currency_unit_price`, etc. |

Logical names are domain words (`unitPrice`, `tax`) — the helper adds `_amount`. Do not use `taxAmount` as logical name (becomes `tax_amount_amount`).

## Migration (legacy QUPS TEXT columns)

| Old SQL | New SQL |
| --- | --- |
| `currency_unit_price`, `currency_subtotal`, … | Single `currency` |
| `unit_price` TEXT | `unit_price_amount` NUMERIC |
| `subtotal` TEXT | `subtotal_amount` NUMERIC |

See [@eristack/qups stores](/docs/qups/stores). Mid-migration: `moneyNamingPresets.legacyQups`.

## Export reference

| Export | Summary |
| --- | --- |
| `moneyField` / `moneyCurrencyField` | Binding: `.columns`, `.pack`, `.unpack`, `.gridFields` |
| `moneyColumns` / `moneyAmountColumn` / `moneyCurrencyColumn` | Low-level spreads |
| `packMoney` / `unpackMoney` | Paired logical field |
| `packMoneyAmount` / `unpackMoneyAmount` | Amount-only + row currency |
| `packCurrencyCode` / `unpackCurrencyCode` | Shared currency column |
| `configureMoneyPersistence` | Global naming partial |
| `createMoneyNamingScope` / `createMoneyNamingScopeWithAdapters` | Scoped naming |
| `moneyNamingPresets` | `readable`, `compact`, `legacyQups` |
| `resolveMoneyColumnNames` / `resolveSharedCurrencyColumnNames` | Name resolution |
| `moneyGridFields` | data-grid filter/sort keys |

Wire JSON for APIs: [REST](./rest.md) · [Zod](./zod.md).
