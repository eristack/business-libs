---
title: Nest adapter
description: "@eristack/timestamp/nest — ParseTimestampPipe for @Body parameters"
sidebar_position: 15
---

# Nest adapter

`@eristack/timestamp/nest` provides a pipe that delegates to [@eristack/timestamp/rest](./rest.md).

```bash
pnpm add @eristack/timestamp @nestjs/common
```

```ts
import { ParseTimestampPipe } from "@eristack/timestamp/nest";
import type { ZonedInstant } from "@eristack/timestamp";
```

Overview: [Adapters](./adapters.md).

## Usage

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { ParseTimestampPipe } from "@eristack/timestamp/nest";

@Controller("invoices")
export class InvoicesController {
  @Post()
  create(@Body("postedAt", ParseTimestampPipe) postedAt: ZonedInstant) {
    return { postedAt };
  }
}
```

The pipe uses the `@Body()` parameter name as the validation path when present.

On `RestTimestampFieldError`, throws `BadRequestException` with `{ message, issues }`.

For DTO-level validation, prefer [Zod](./zod.md) schemas in your contracts module and keep the pipe for single-field params.
