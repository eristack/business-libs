---
title: Stores & Drizzle
description: FormatStore, SequenceStore, memory and Drizzle implementations, and locking
sidebar_position: 7
---

# Stores & Drizzle

`createDocNumber` is a coordinator. Persistence lives behind two small interfaces, so you can start in memory, move to Drizzle, and later move allocation to Redis without rewriting any domain code.

## The interfaces

### `FormatStore`

```ts
interface FormatStore {
  save(record: FormatRecord): Promise<void>;
  findById(id: string): Promise<FormatRecord | null>;
  findActiveByEntityKey(entityKey: string): Promise<FormatRecord | null>;
  listByEntityKey(entityKey: string): Promise<FormatRecord[]>;
}
```

`save` is an **upsert** by `id` — the core calls it both to create and to deactivate siblings. The "one active format per `entityKey`" invariant is enforced by the core, not by the store; a store only has to persist what it is given and, when several rows are active for a key, prefer the most recently updated in `findActiveByEntityKey`.

### `SequenceStore`

```ts
interface SequenceStore {
  /** Atomically allocate and return the next sequence integer (1-based). */
  allocateNext(input: { formatId: string; periodKey: string }): Promise<number>;
  /** Current value without allocating; `null` if no row yet. */
  getCurrent(input: { formatId: string; periodKey: string }): Promise<number | null>;
  /** Next value that would be allocated, without writing. */
  peekNext(input: { formatId: string; periodKey: string }): Promise<number>;
}
```

Contract for implementers:

- A bucket that has never been touched allocates **1**
- `getCurrent` returns `null` (not `0`) for an untouched bucket
- `peekNext` equals `(getCurrent ?? 0) + 1` and must not write
- `allocateNext` should be atomic to the strongest degree your backend allows

### `Incrementer`

```ts
type Incrementer = (input: { formatId: string; periodKey: string }) => Promise<number>;
```

A one-function escape hatch. When supplied it **replaces** `sequences.allocateNext` for `next()`; it cannot serve `peekNext()`. See [Sequencing](./sequencing.md#next-vs-peeknext).

## Memory stores

```ts
import {
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "@eristack/doc-number";
```

| Store | Behaviour |
| --- | --- |
| `createMemoryFormatStore()` | `Map` keyed by id; returns cloned records; sorts by `updatedAt` desc |
| `createMemorySequenceStore()` | `Map` keyed by `formatId + periodKey`; `allocateNext` runs through an async mutex so concurrent calls in one process never collide |

They are complete implementations, ideal for unit tests, examples, and CLI scripts — and unusable across processes, because the state dies with the Node instance.

## Drizzle

```ts
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";

export const docNumberFormats = createDocNumberFormatTable("pgsql");
export const docNumberSequences = createDocNumberSequenceTable("pgsql");

export const docNumber = createDocNumber({
  formats: createDrizzleFormatStore({
    dialect: "pgsql",
    db,
    table: docNumberFormats,
  }),
  sequences: createDrizzleSequenceStore({
    dialect: "pgsql",
    db,
    table: docNumberSequences,
  }),
});
```

Dialects: **`pgsql`** | `mysql` | `sqlite`. (`pgsql`, not `postgres` — the spelling matches [`@eristack/jwt-auth`](/docs/jwt-auth) and the rest of the stack.)

Both table factories take an optional table name if the defaults clash with your schema:

```ts
createDocNumberFormatTable("pgsql", "numbering_formats");
createDocNumberSequenceTable("pgsql", "numbering_sequences");
```

Dialect-specific factories (`createPgsqlDocNumberFormatTable`, `createMysqlDocNumberSequenceTable`, …) are exported too, for when a union return type gets in the way of your typing.

### `doc_number_formats`

| Column | pgsql | mysql | sqlite | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` PK | `varchar(64)` PK | `text` PK | From `idFactory` |
| `entity_key` | `text` NOT NULL | `varchar(255)` | `text` | Opaque key |
| `pattern` | `text` NOT NULL | `varchar(512)` | `text` | Token string |
| `reset` | `text` NOT NULL | `varchar(32)` | `text` | `never` \| `yearly` \| `monthly` \| `daily` |
| `prefix` | `text` NULL | `varchar(128)` NULL | `text` NULL | `null` ⇄ `undefined` on the record |
| `active` | `boolean` NOT NULL | `boolean` | `integer` (boolean mode) | One true per `entity_key` |
| `created_at` | `timestamptz` | `datetime` | `integer` (ms) | |
| `updated_at` | `timestamptz` | `datetime` | `integer` (ms) | Tie-break for "most recent active" |

Suggested index for busy installations: `(entity_key, active)`.

### `doc_number_sequences`

| Column | pgsql | mysql | sqlite | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` PK | `varchar(64)` PK | `text` PK | Row id |
| `format_id` | `text` NOT NULL | `varchar(64)` | `text` | FK-ish to the format |
| `period_key` | `text` NOT NULL | `varchar(32)` | `text` | `*`, `2026`, `2026-08`, `2026-08-11` |
| `current_value` | `integer` NOT NULL | `int` | `integer` | Last allocated value |
| `updated_at` | `timestamptz` | `datetime` | `integer` (ms) | |

A **unique index** on `(format_id, period_key)` ships with the table, named `<table>_format_period_uidx`. It is the safety net that turns a concurrent "insert the first row of a new month" race into a constraint violation instead of two counters.

The package does not declare a foreign key from sequences to formats — deleting a format row while its counters exist would otherwise cascade away your numbering history. Add one yourself if your policy prefers it.

### Migrations

The tables are ordinary Drizzle table objects. Export them from your schema module and let `drizzle-kit` generate the migration:

```ts
// db/schema.ts
export { docNumberFormats, docNumberSequences } from "./doc-number.js";
```

The package never runs DDL, never opens a connection, and never reads `process.env`.

## Concurrency recipe

`createDrizzleSequenceStore` uses read-then-update against the `db` you injected. That is portable and transaction-friendly, and it is **not** a lock. Under real concurrency, serialise allocation yourself.

### PostgreSQL

```ts
import { sql } from "drizzle-orm";

export async function issueInvoiceNumber(db: AppDb, entityKey: string) {
  return db.transaction(async (tx) => {
    const format = await docNumberFor(tx).getFormat(entityKey);
    if (!format) throw new Error(`No active format for ${entityKey}`);

    const periodKey = periodKeyFor(format.reset, new Date());

    await tx.execute(sql`
      SELECT current_value
      FROM doc_number_sequences
      WHERE format_id = ${format.id} AND period_key = ${periodKey}
      FOR UPDATE
    `);

    return docNumberFor(tx).next({ entityKey });
  });
}
```

`docNumberFor(tx)` is your helper that builds a `createDocNumber` bound to the transaction handle, so the store's read-then-update runs inside the same lock.

The `FOR UPDATE` returns zero rows for a brand-new period and therefore locks nothing. That gap is covered by the unique index: two callers both insert, one loses with a constraint violation, and a single retry reads the winner's row.

```ts
try {
  return await issueInvoiceNumber(db, "invoice");
} catch (error) {
  if (isUniqueViolation(error)) return issueInvoiceNumber(db, "invoice");
  throw error;
}
```

### MySQL

Same shape with `SELECT … FOR UPDATE`, or `INSERT … ON DUPLICATE KEY UPDATE current_value = current_value + 1` followed by a read if you prefer a single statement.

### SQLite

Writers are already serialised. Use a transaction for correctness of the surrounding insert; no explicit lock is needed.

### Or move allocation out of SQL

If lock contention becomes the bottleneck, hand `next()` a Redis counter and keep the store for peeking:

```ts
createDocNumber({
  formats,
  sequences, // still serves peekNext
  incrementer: ({ formatId, periodKey }) =>
    redis.incr(`docnum:${formatId}:${periodKey}`),
});
```

Full walkthrough, including seeding Redis from the SQL counter, is in [Recipes](./recipes.md#recipe-redis-incrementer).

## Writing your own store

Anything that satisfies the interface works — Mongo, Prisma, DynamoDB, a vendor API. A minimal counter table is enough:

```ts
const sequences: SequenceStore = {
  async allocateNext({ formatId, periodKey }) {
    const [row] = await db
      .insert(counters)
      .values({ formatId, periodKey, currentValue: 1 })
      .onConflictDoUpdate({
        target: [counters.formatId, counters.periodKey],
        set: { currentValue: sql`${counters.currentValue} + 1` },
      })
      .returning({ value: counters.currentValue });
    return row.value;
  },
  async getCurrent({ formatId, periodKey }) {
    /* … return null when missing … */
  },
  async peekNext(input) {
    return ((await this.getCurrent(input)) ?? 0) + 1;
  },
};
```

An upsert-with-increment like this is atomic in one statement and is the strongest option when your database supports it.

## Next steps

- [Sequencing](./sequencing.md) — gaps, backfills, and what "atomic" buys you
- [Formats & listing](./formats-and-listing.md) — the format CRUD surface
- [HTTP & UI adapters](./http-and-ui.md) — exposing configuration to admins
