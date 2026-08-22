---
title: Nest adapter
description: "@eristack/money/nest — ParseMoneyPipe for @Body parameters"
sidebar_position: 18
---

# Nest adapter

`@eristack/money/nest` provides a pipe that parses `@Body` parameters through [@eristack/money/rest](./rest.md). No module, no guard, no controller.

```bash
pnpm add @eristack/money @nestjs/common
```

```ts
import { ParseMoneyPipe } from "@eristack/money/nest";
import type { Money } from "@eristack/money";
```

Overview: [Adapters](./adapters.md).

## ParseMoneyPipe

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { ParseMoneyPipe } from "@eristack/money/nest";
import type { Money } from "@eristack/money";

@Controller("lines")
export class LinesController {
  @Post()
  create(
    @Body("subtotal", ParseMoneyPipe) subtotal: Money,
    @Body("tax", new ParseMoneyPipe("tax")) tax: Money,
  ) {
    return { total: subtotal.add(tax).toJSON() };
  }
}
```

Constructor `new ParseMoneyPipe(path?)` — default path `"money"`. When used as `@Body("subtotal", ParseMoneyPipe)`, the parameter name `"subtotal"` becomes the error path.

## Errors

On `RestMoneyFieldError`, the pipe throws `BadRequestException` with:

```json
{ "message": "…", "issues": [{ "path": "subtotal", "message": "…" }] }
```

Same underlying validation as [REST](./rest.md) and [Express](./express.md).

## Zod-first apps

If the app uses `nestjs-zod` / `ZodValidationPipe` on DTOs, prefer [Zod](./zod.md) `moneySchema` on fields instead of this pipe. Use `ParseMoneyPipe` when you want a minimal dependency on a single `@Body` field without a full DTO schema.

## What this is not

- Not SQL persistence — [Drizzle](./drizzle.md)
- Not a global validation pipe — register per parameter

## See also

- [REST](./rest.md)
- [Express](./express.md)
- [Zod](./zod.md)
