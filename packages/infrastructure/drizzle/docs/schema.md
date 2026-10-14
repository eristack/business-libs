---
title: Schema helpers
description: Dialect column builders and createEristackSpineTables for sqlite and Postgres app schema.ts files.
---

# Schema helpers (B3 step 2)

Import from `@eristack/drizzle/schema` — not from table packages directly when you want one dialect switch.

## Column builders

| Helper | Postgres | SQLite |
| --- | --- | --- |
| `dialectText` | `text` | `text` |
| `dialectFlag` | `boolean` | integer boolean |
| `dialectJson` / `dialectJsonMap` | `jsonb` | `text` + `$type` |
| `dialectStringList` | `jsonb` string array | `text` string array |
| `dialectTimestampJson` | `@eristack/timestamp` wire JSON | same |
| `entityIdColumn` | re-export from `@eristack/entity-id/drizzle` | same |

Partial indexes and dialect-specific `now()` stay in app SQL — escape hatch by design.

## Spine tables

```ts
import { createEristackSpineTables, dialectText, entityIdColumn } from "@eristack/drizzle/schema";

export const DIALECT = (process.env.APP_DB_DIALECT ?? "pgsql") as "pgsql" | "sqlite";

export const spine = createEristackSpineTables({
  dialect: DIALECT,
  backseatDocuments: true,
});

// App users + invoices: same DIALECT, dialectText / dialectFlag / dialectJsonMap on your table builder
// (pgTable when pgsql, sqliteTable when sqlite — or split schema files per dialect until casts shrink).
export const {
  jwtAuthCredentials,
  jwtAuthRefreshTokens,
  docNumberFormats,
  docNumberSequences,
  backseatDocuments,
  permissions,
  roles,
} = spine;
```

App-owned business tables use the same `DIALECT` constant and column helpers so `schema.ts` type-checks once per dialect. **B4** collection codegen builds on this — do not duplicate row mappers until step 2 is in the consumer.

## Exports

Subpath `@eristack/drizzle/schema` only — keeps `openDrizzle` entry free of spine peer deps when an app imports boot without schema helpers.
