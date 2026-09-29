---
title: Getting started
description: "Optional peers: drizzle-orm, zod."
---

# Getting started

## Install

```bash
pnpm add @eristack/entity-id
```

Optional peers: `drizzle-orm`, `zod`.

## Generate and parse

```ts
import {
  generateEntityId,
  parseEntityId,
  entityIdToDate,
  compareEntityIds,
} from "@eristack/entity-id";

const id = generateEntityId();
const canonical = parseEntityId(id); // lowercase + hyphens, version 7 only

entityIdToDate(canonical); // Date from embedded unix ms

compareEntityIds(idA, idB); // localeCompare — time order for generated ids
```

Accept API input with or without hyphens; always **persist** the canonical form from `parseEntityId`.

## Drizzle table

```ts
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const partners = pgTable("partners", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});
```

SQLite tests: `entityIdColumn("sqlite", "id")`.

## API validation

```ts
import { entityIdSchema } from "@eristack/entity-id/zod";

const body = entityIdSchema.parse(req.body.parentId);
```

## Production path

1. Default PK with `entityIdColumn` + `.primaryKey()`.
2. `parseEntityId` on every foreign key string from HTTP/JSON.
3. Do not use serial integers for public document ids — use `@eristack/doc-number` for display numbers.
