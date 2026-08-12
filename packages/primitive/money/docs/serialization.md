---
title: Serialization
description: JSON shape for APIs and persistence
sidebar_position: 12
---

# Serialization

## JSON shape

```json
{
  "currency": "USD",
  "amount": "19.99"
}
```

`amount` is always a **decimal string**, never a JSON number.

```ts
import { Money, moneyFromJSON, moneyToJSON } from "@eristack/money";

const money = Money.of("19.99", "USD");
const json = moneyToJSON(money);
const restored = moneyFromJSON(json);
```

`Money` also implements `toJSON()`, so `JSON.stringify(money)` emits the same shape.

## Anti-patterns

```ts
// Bad — binary float in transit
{ currency: "USD", amount: 19.99 }

// Bad — major/minor ambiguity without documented scale
{ currency: "USD", amount: 1999 }
```

If you store minor units in your database, keep scale explicit in the schema and rebuild with `Money.ofMinor`.
