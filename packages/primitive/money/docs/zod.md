---
title: Zod adapter
description: "@eristack/money/zod — Zod 4 schemas for MoneyJSON and Money"
sidebar_position: 16
---

# Zod adapter

`@eristack/money/zod` provides Zod **4** schemas for wire validation and domain parsing. Optional peer: **`zod: ^4.0.0` only** — no Zod 3 support.

```bash
pnpm add @eristack/money zod@^4
```

```ts
import { z } from "zod"; // or "zod/v4" — equivalent on v4
import {
  moneyJSONSchema,
  moneySchemaDefault,
  createMoneySchema,
  currencyCodeSchema,
} from "@eristack/money/zod";
```

Implementation imports `{ z } from "zod"` because the package peers v4 only. Semantic validation uses the same `validateMoneyJSON` as [REST](./rest.md).

Overview: [Adapters](./adapters.md).

## Wire-only schemas

For OpenAPI-friendly types that stay nested JSON:

```ts
const WireInvoice = z.object({
  id: z.string(),
  subtotal: moneyJSONSchema,
  tax: moneyJSONSchemaOptional,
});
type WireInvoice = z.infer<typeof WireInvoice>;
```

| Export | Output |
| --- | --- |
| `moneyJSONSchema` | `{ currency, amount }` strings; rejects numeric `amount` |
| `moneyJSONSchemaOptional` | same \| `undefined` |
| `moneyJSONSchemaNullable` | same \| `null` |
| `moneyFormValueSchema` | Alias of `moneyJSONSchema` |

Currency shape: uppercase alphanumeric, length 3–16 (custom codes like `PTS` allowed; not a fixed ISO enum).

## Parse to Money

```ts
const CreateLineBody = z.object({
  quantity: z.string(),
  unitPrice: moneySchemaDefault,
  subtotal: moneySchemaOptional(),
});
CreateLineBody.parse(body); // unitPrice: Money
```

| Export | Output |
| --- | --- |
| `moneySchema(path?)` / `moneySchemaDefault` | `Money` |
| `moneySchemaOptional(path?)` | `Money \| undefined` |
| `createMoneySchema({ currency, nonZero, min, max, path })` | Constrained `Money` |

```ts
const usdOnly = createMoneySchema({ currency: "USD", nonZero: true });
```

## Shared row currency (QUPS-style)

Flat amount strings on the wire object; currency once on the parent:

```ts
const LineBody = z.object({
  currency: currencyCodeSchema(),
  unitPrice: moneyAmountOnlySchema,
  subtotal: moneyAmountOnlySchema,
});
```

`currencyCodeSchema(path?)` validates against the money currency registry.

Combine with `superRefine` if you need cross-field checks (e.g. all amounts parse under `row.currency`).

## Error shape

Shape failures: standard Zod issues (`amount` must be string).

Semantic failures (unknown currency, invalid decimal): `custom` issues via `superRefine` — e.g. `subtotal.currency: unknown code "XXX"`. Works with Nest `ZodValidationPipe` and similar.

## Deliberately omitted (v1)

- `z.coerce.number()` on `amount`
- Flat `{ subtotal_amount, subtotal_currency }` objects — flat columns are [Drizzle](./drizzle.md) only
- Zod 3 dual schemas — upgrade apps to v4 or use [REST](./rest.md) until then

## Export reference

| Export | Summary |
| --- | --- |
| `moneyJSONSchema` | Strict wire object |
| `moneyJSONSchemaOptional` / `moneyJSONSchemaNullable` | Optional/nullable wire |
| `moneySchema` / `moneySchemaDefault` | Wire → `Money` |
| `moneySchemaOptional` | Optional `Money` |
| `createMoneySchema` | Fixed currency, min/max, nonZero |
| `moneyAmountOnlySchema` | `{ amount: string }` |
| `moneyFormValueSchema` | Form wire alias |
| `currencyCodeSchema` | Registry-backed currency string |
