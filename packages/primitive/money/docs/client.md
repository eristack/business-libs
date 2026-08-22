---
title: Client adapter
description: "@eristack/money/client — revive MoneyJSON to Money after HTTP fetch"
sidebar_position: 19
---

# Client adapter

`@eristack/money/client` revives wire JSON into live `Money` instances after HTTP (or any JSON transport). Framework-agnostic — no React, no TanStack Query.

```ts
import {
  reviveMoney,
  reviveMoneyFields,
  isMoneyJSON,
} from "@eristack/money/client";
```

Use with your app's `fetch`, `@eristack/*/client` packages, or Backseat responses. Form field helpers live in [React](./react.md), not here.

Overview: [Adapters](./adapters.md). Wire shape: [Serialization](./serialization.md).

## Single field

```ts
import { Money } from "@eristack/money";
import { reviveMoney, reviveMoneyFields } from "@eristack/money/client";

const invoice = await api.getInvoice(id);
const total = reviveMoney(invoice.total);
total.add(Money.of("1", "USD")); // live Money
```

`reviveMoney` calls `Money.fromJSON` — throws on invalid shape or unknown currency (same as core).

## Multiple fields on an object

```ts
const line = reviveMoneyFields(invoice.line, [
  "unitPrice",
  "subtotal",
  "tax",
  "total",
]);
// line.unitPrice, line.subtotal, … are Money; other keys unchanged
```

Skips `null` / `undefined` fields without error.

## Type guard

```ts
if (isMoneyJSON(value)) {
  // { currency: string; amount: string }
}
```

Same shape check as `@eristack/money/rest` `isMoneyJSON`.

## Typical flow

```text
Server                          Client
──────                          ──────
Money → toJSON() / sendMoney    fetch JSON
{ currency, amount }     →      reviveMoney(json) → Money
```

Server-side parsing before business logic: [REST](./rest.md) or [Express](./express.md). Client-side is **after** JSON is already on the wire.

## Export reference

| Export | Summary |
| --- | --- |
| `reviveMoney(value)` | `unknown` → `Money` |
| `reviveMoneyFields(obj, fields)` | Shallow copy with listed keys revived |
| `isMoneyJSON(value)` | Type guard |

## See also

- [React](./react.md) — TanStack Form string state and submit
- [REST](./rest.md) — server parse/serialize
