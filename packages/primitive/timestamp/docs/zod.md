---
title: Zod adapter
description: "@eristack/timestamp/zod — Zod 4 schemas for TimestampJSON and parsed Timestamp"
sidebar_position: 13
---

# Zod adapter

`@eristack/timestamp/zod` ships Zod **4** schemas (peer `zod ^4.0.0`). Schemas call core `validateTimestampJSON` so REST and Zod cannot drift.

```bash
pnpm add @eristack/timestamp zod@^4
```

```ts
import {
  timestampJSONSchema,
  timestampSchemaDefault,
  instantSchema,
  wallSchema,
  timeZoneIdSchema,
} from "@eristack/timestamp/zod";
```

Overview: [Adapters](./adapters.md).

## JSON-only schemas

Validate wire shape without constructing Temporal values:

```ts
timestampJSONSchema.parse(body.postedAt);
instantJSONSchema.parse(body.postedAt);
wallJSONSchema.parse(body.dueAt);
```

Optional/nullable variants: `timestampJSONSchemaOptional`, `timestampJSONSchemaNullable`.

## Parse to Timestamp

```ts
const posted = timestampSchemaDefault.parse(body.postedAt);
// ZonedInstant | WallClock

const due = wallSchema().parse(body.dueAt);
// WallClock
```

`instantSchema()` / `wallSchema()` narrow `kind` after transform.

## Contracts package

```ts
import { z } from "zod";
import {
  timestampJSONSchema,
  wallJSONSchema,
} from "@eristack/timestamp/zod";

export const InvoiceCreate = z.object({
  postedAt: timestampJSONSchema,
  dueAt: wallJSONSchema,
});
```

Use `timestampSchemaDefault` when the handler wants typed `Timestamp`, not raw JSON.
