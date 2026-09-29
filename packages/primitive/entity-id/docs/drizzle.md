---
title: Drizzle
description: "Pass optional { sqlName: \"partner_id\" } when the property name differs from the SQL column."
---

# Drizzle

```bash
pnpm add @eristack/entity-id drizzle-orm
```

## `entityIdColumn`

```ts
import { entityIdColumn } from "@eristack/entity-id/drizzle";

entityIdColumn("pgsql", "id"); // uuid().$defaultFn(() => generateEntityId()) — app-side default, not DB serial/identity
entityIdColumn("mysql", "id"); // char(36)
entityIdColumn("sqlite", "id"); // text
```

Pass optional `{ sqlName: "partner_id" }` when the property name differs from the SQL column.

## Foreign keys

Use the same column helper on FK columns **without** `$defaultFn` — only call `parseEntityId` in the app layer before insert.

## Migrations

Postgres: native `uuid` type. Existing v4 columns require a one-time migration strategy in the app — this package does not migrate legacy data.
