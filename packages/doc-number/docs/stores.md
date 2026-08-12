---
title: Stores & Drizzle
description: FormatStore, SequenceStore, and custom incrementers
sidebar_position: 4
---

# Stores & Drizzle

## Interfaces

- **FormatStore** — persist format definitions per opaque `entityKey`
- **SequenceStore** — `allocateNext` / `getCurrent` / `peekNext` for `(formatId, periodKey)`
- **Incrementer** — optional function; when set, used instead of `sequences.allocateNext`

Memory implementations ship in the root entry for tests and demos.

## Drizzle

```ts
import { createDocNumber } from "@eristack/doc-number";
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";

const formatTable = createDocNumberFormatTable("pgsql"); // or mysql | sqlite
const sequenceTable = createDocNumberSequenceTable("pgsql");

const docNumber = createDocNumber({
  formats: createDrizzleFormatStore({ dialect: "pgsql", db, table: formatTable }),
  sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: sequenceTable }),
});
```

Default table names: `doc_number_formats`, `doc_number_sequences`.

`allocateNext` uses read-then-update. For high concurrency, wrap calls in a
transaction with row locks (e.g. `SELECT … FOR UPDATE` on Postgres) in the app.

## Custom incrementer

```ts
const docNumber = createDocNumber({
  formats,
  sequences, // still useful for peekNext
  incrementer: async ({ formatId, periodKey }) => {
    return myRedisIncr(`${formatId}:${periodKey}`);
  },
});
```

## Format configuration API

Beyond `registerFormat` / `getFormat`:

- `listFormats(entityKey)`
- `getFormatById(id)`
- `updateFormat({ id, pattern?, reset?, prefix?, active?, entityKey? })`

Setting `active: true` on register/update deactivates other formats for the same
`entityKey` (one active format per entity). HTTP adapters for settings UIs are
documented in [Adapters](./adapters).
