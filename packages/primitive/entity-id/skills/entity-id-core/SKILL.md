---
name: entity-id-core
description: >
  @eristack/entity-id UUID v7 generate/parse/compare, entityIdToDate, Drizzle entityIdColumn,
  zod entityIdSchema — sortable PKs for new ERP tables. Wave 13 E1; no sibling deps.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/primitive/entity-id/docs/getting-started.md
---

# @eristack/entity-id

**UUID v7** primary keys — time-sortable, strict parse (version 7 only).

```ts
import { generateEntityId, parseEntityId } from "@eristack/entity-id";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

const id = generateEntityId();
parseEntityId(id);

// Drizzle
id: entityIdColumn("pgsql", "id").primaryKey(),
```

## Checklist

1. Default new table PKs with `entityIdColumn` + `generateEntityId` — not serial/bigserial, not DB `gen_random_uuid()` / identity columns, not `crypto.randomUUID()` in Eristack cores (`entityIdFactory` is the default idFactory).
2. All `@eristack/*/drizzle` shipped tables use `entityIdColumn` on surrogate `id` — match in app-owned tables.
3. `parseEntityId` on every FK string from JSON before insert.
4. `@eristack/entity-id/zod` on HTTP bodies for id fields.
5. Display numbers still use `@eristack/doc-number` — entity id is internal PK.
6. Multi-package Wave 13: `#party-and-platform-compose` — do not add sibling primitive deps.

## Do not

- Accept UUID v4 on new APIs when standardizing v7
- Use floats or numbers for ids in JSON
- Duplicate v7 bit layout in the app — use this package
