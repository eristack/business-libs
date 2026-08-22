---
title: REST adapter
description: "@eristack/money/rest — parse and serialize MoneyJSON at HTTP boundaries"
sidebar_position: 15
---

# REST adapter

`@eristack/money/rest` is a **framework-free codec** for `MoneyJSON`. It does not ship routes, middleware, or a money CRUD router.

```ts
import {
  parseMoneyJSON,
  serializeMoney,
  parseMoneyFields,
  serializeMoneyFields,
  isMoneyJSON,
  validateMoneyJSON,
  RestMoneyFieldError,
} from "@eristack/money/rest";
```

Use in headless REST actions, custom handlers, or before your own validation layer. For Express/Nest wiring, see [Express](./express.md) and [Nest](./nest.md). For declarative schemas, see [Zod](./zod.md).

Overview: [Adapters](./adapters.md). Wire shape: [Serialization](./serialization.md).

## Wire shape

```json
{ "currency": "USD", "amount": "19.99" }
```

`amount` must be a **string**, never a JSON number. Same rules as `moneyToJSON` / `moneyFromJSON` in core.

## Parse

```ts
const subtotal = parseMoneyJSON(body.subtotal, "subtotal");
// path argument → field name in error messages
```

```ts
const { subtotal, tax, total } = parseMoneyFields(body, [
  "subtotal",
  "tax",
  "total",
]);
```

`parseMoneyFields` requires `body` to be a plain object. Each missing or invalid field throws with that field's path.

## Serialize

```ts
res.json({
  subtotal: serializeMoney(subtotal),
  total: serializeMoney(total),
});

const wire = serializeMoneyFields({
  subtotal: line.subtotal,
  tax: line.tax,
  discount: null,
});
```

## Validation without Money

`validateMoneyJSON(value, path)` returns a typed `MoneyJSON` or throws `ParseError`. The Zod adapter calls this internally so REST and Zod cannot drift.

`isMoneyJSON(value)` is a type guard for `{ currency, amount }` shape checks.

## Errors

`RestMoneyFieldError` extends `Error`:

- `path` — field name (e.g. `"subtotal"`)
- `issues` — `[{ path, message }]`

Map to HTTP 400 in your handler:

```ts
try {
  const m = parseMoneyJSON(body.amount, "amount");
} catch (error) {
  if (error instanceof RestMoneyFieldError) {
    return res.status(400).json({ issues: error.issues });
  }
  throw error;
}
```

[Express](./express.md) and [Nest](./nest.md) wrap this error type.

## Export reference

| Export | Summary |
| --- | --- |
| `parseMoneyJSON(value, path?)` | `unknown` → `Money` |
| `serializeMoney(money)` | `Money` → `MoneyJSON` |
| `parseMoneyFields(body, fields)` | Pick keys → `Record<string, Money>` |
| `serializeMoneyFields(values)` | `Record<string, Money>` → wire objects |
| `validateMoneyJSON(value, path?)` | `unknown` → `MoneyJSON` |
| `isMoneyJSON(value)` | Type guard |
| `RestMoneyFieldError` | Field-path parse failure |

## What this is not

- Not a substitute for [Drizzle](./drizzle.md) — SQL uses flat columns, not nested JSON in the DB.
- Not OpenAPI generation — use [Zod](./zod.md) schemas for contract types if needed.
