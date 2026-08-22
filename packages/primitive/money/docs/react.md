---
title: React adapter
description: "@eristack/money/react — TanStack Form money field helpers"
sidebar_position: 20
---

# React adapter

`@eristack/money/react` helpers for **TanStack Form** (and similar) when field values must stay plain `{ currency, amount }` strings — not `Money` class instances.

```bash
pnpm add @eristack/money @tanstack/react-form
```

```ts
import {
  moneyFormValue,
  parseMoneyFormValue,
  submitMoneyFormValue,
  createMoneyFieldValidators,
  moneyFormValueSchema,
} from "@eristack/money/react";
```

Peer: `@tanstack/react-form` (optional). No UI components. Fetch/revive without forms: [Client](./client.md).

Overview: [Adapters](./adapters.md).

## Form defaults

```ts
import { moneyFormValue } from "@eristack/money/react";

const defaultValues = {
  subtotal: moneyFormValue(existingMoney), // { currency: "USD", amount: "19.99" }
};
```

`moneyFormValueSchema` (re-exported from [Zod](./zod.md)) matches the same shape for contract validation.

## Submit → Money

```ts
import { submitMoneyFormValue } from "@eristack/money/react";

const onSubmit = ({ value }) => {
  const subtotal = submitMoneyFormValue(value.subtotal);
  // rounded with Rounding.currencyDefault() by default

  const raw = submitMoneyFormValue(value.subtotal, { round: false });
};
```

`parseMoneyFormValue(value, path?)` parses without rounding when you need intermediate validation.

## Validators

```ts
validators: createMoneyFieldValidators({
  required: true,
  currency: "USD",
  round: false,
})
```

Returns `{ onChange, onSubmit }` validators compatible with TanStack Form field options.

## QUPS alignment

`@eristack/qups` `calculateLine` uses flat strings (`currency`, `unitPrice`, `subtotal`) — same convention. You can bind QUPS calculated fields directly without putting `Money` in form state.

Display formatting: `formatMoney` from core `@eristack/money`.

## What this is not

- Not TanStack Query hooks — use [Client](./client.md) `reviveMoney` on query results
- Not SQL — [Drizzle](./drizzle.md)
- Not server validation — [REST](./rest.md) / [Zod](./zod.md)

## Export reference

| Export | Summary |
| --- | --- |
| `moneyFormValue(money)` | `Money` → form wire object |
| `parseMoneyFormValue(value, path?)` | Form value → `Money` |
| `submitMoneyFormValue(value, { round? })` | Submit path with default rounding |
| `createMoneyFieldValidators(options)` | TanStack Form validators |
| `moneyFormValueSchema` | Zod wire schema re-export |

## See also

- [Client](./client.md)
- [Serialization](./serialization.md)
- [@eristack/qups form & backend](/docs/qups/form-and-be)
