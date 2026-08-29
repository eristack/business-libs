---
title: Express adapter
description: "@eristack/money/express — readMoney and sendMoney for Express routes"
sidebar_position: 17
---

# Express adapter

`@eristack/money/express` wraps [@eristack/money/rest](./rest.md) for Express handlers. No router, no `MoneyModule`.

```bash
pnpm add @eristack/money express
```

```ts
import {
  readMoney,
  readMoneyField,
  rejectJsonNumberMoneyBody,
  sendMoney,
  RestMoneyFieldError,
} from "@eristack/money/express";
```

Overview: [Adapters](./adapters.md).

## Reject JSON number amounts (middleware)

Wire `MoneyJSON.amount` must be a **decimal string**. Catch bad clients before handlers run:

```ts
import express from "express";
import { rejectJsonNumberMoneyBody } from "@eristack/money/express";

const app = express();
app.use(express.json());
app.use(rejectJsonNumberMoneyBody());
```

`findJsonNumberMoneyFields(body)` walks nested objects and returns paths like `body.lines[0].price`.

## Read request bodies

```ts
import type { Request, Response } from "express";
import { readMoney, sendMoney } from "@eristack/money/express";

app.post("/lines", (req, res) => {
  try {
    const subtotal = readMoney(req.body.subtotal, "subtotal");
    const tax = readMoney(req.body.tax, "tax");
    // business logic…
    res.json({ total: sendMoney(subtotal.add(tax)) });
  } catch (error) {
    if (error instanceof RestMoneyFieldError) {
      return res.status(400).json({ issues: error.issues });
    }
    throw error;
  }
});
```

`readMoney(value, path?)` — same as `parseMoneyJSON` from [REST](./rest.md).

`readMoneyField(body, field)` — reads one key from a body object; throws if `body` is not an object.

## Send responses

```ts
sendMoney(total); // → { currency: "USD", amount: "19.99" }
```

Use inside `res.json({ total: sendMoney(total) })`. Equivalent to `serializeMoney` from REST.

## Errors

Re-exports `RestMoneyFieldError` from REST. Catch it at route boundaries for 400 responses with `issues` array.

For multi-field parse in one shot, import `parseMoneyFields` from `@eristack/money/rest` directly in the handler.

## What this is not

- Not a replacement for [Zod](./zod.md) when you already use `ZodValidationPipe`-style validation in Express via middleware you own.
- Not SQL persistence — see [Drizzle](./drizzle.md).

## See also

- [REST](./rest.md) — headless codec
- [Nest](./nest.md) — `ParseMoneyPipe` for NestJS
- [Client](./client.md) — browser revive after fetch
