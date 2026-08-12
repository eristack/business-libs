---
title: Sequencing
description: Reset periods, allocation, peeking, historical periods, and concurrency
sidebar_position: 5
---

# Sequencing

Rendering a string is the easy half. This page is about the integer: where it comes from, when it restarts, and what happens when two requests arrive at once.

## Reset periods and period keys

`reset` lives on the format record. It is turned into a `periodKey` at allocation time using the **UTC** calendar parts of the timestamp:

| `reset` | `periodKey` for `2026-08-11T10:00:00Z` | New counter when… |
| --- | --- | --- |
| `never` | `*` | Never |
| `yearly` | `2026` | UTC year rolls over |
| `monthly` | `2026-08` | UTC month rolls over |
| `daily` | `2026-08-11` | UTC day rolls over |

```ts
import { periodKeyFor } from "@eristack/doc-number";

periodKeyFor("never",   new Date("2026-08-11T10:00:00Z")); // "*"
periodKeyFor("yearly",  new Date("2026-08-11T10:00:00Z")); // "2026"
periodKeyFor("monthly", new Date("2026-08-11T10:00:00Z")); // "2026-08"
periodKeyFor("daily",   new Date("2026-08-11T10:00:00Z")); // "2026-08-11"
```

Sequence rows are keyed by the pair `(formatId, periodKey)`. A reset therefore **opens a new row** rather than resetting an old one — last month's final value stays readable, which is exactly what an auditor asks for.

> **Pair the reset with the pattern.** `reset: "monthly"` wants `{MM}` (or `{DD}`) in the pattern; otherwise the rendered value repeats across months. `reset: "never"` wants no date tokens at all, or the date becomes decoration on a counter that keeps climbing.

## Allocation is 1-based

The first number in any bucket is **1**, never 0:

```ts
await docNumber.next({ entityKey: "invoice" }); // sequence: 1 → INV-202608-00001
await docNumber.next({ entityKey: "invoice" }); // sequence: 2 → INV-202608-00002
```

A `SequenceStore` starts a missing bucket at 1 (`peekNext` on an untouched bucket also returns 1, and `getCurrent` returns `null`). If you write your own store or incrementer, honour that: business users read `…-00000` as a bug.

## `next` vs `peekNext`

| | `next(input)` | `peekNext(input)` |
| --- | --- | --- |
| Advances the counter | **Yes** | No |
| Returns | `{ value, sequence, periodKey, formatId, entityKey, pattern }` | `{ value, sequence, periodKey }` |
| Works with a custom `incrementer` | Yes | **No** — requires a `SequenceStore` |
| Safe to call from a settings screen | No | Yes |
| Stable | It is *yours* | A hint that another request may take first |

```ts
const preview = await docNumber.peekNext({ entityKey: "invoice" });
// show "Next invoice: INV-202608-00007" in the UI

const issued = await docNumber.next({ entityKey: "invoice" });
// persist issued.value on the document
```

Both resolve the active format first and throw `FormatNotFoundError` when there is none.

> **Never persist a peeked value.** Peek is for display. Between the peek and the save, a concurrent request can consume that integer, and you would write a duplicate. Allocate with `next()` inside the same transaction as the insert.

### Why `peekNext` needs a store

`Incrementer` is a single function whose only capability is "give me the next integer" — allocation and read are the same call. There is no way to look without touching. So:

```ts
createDocNumber({ formats, incrementer });
// next()     → OK
// peekNext() → MissingDependencyError:
//   "createDocNumber requires sequences (SequenceStore) for peekNext
//    (custom incrementer does not support peek)"
```

Supply both when you want Redis-speed allocation *and* a preview:

```ts
createDocNumber({ formats, sequences, incrementer });
// next()     → incrementer (takes precedence)
// peekNext() → sequences.peekNext
```

Be aware that the two counters are then independent unless your incrementer also writes back to the store. Treat the peek as approximate, or accept the mismatch knowingly.

## Historical periods and backfills

Pass `at` to allocate inside a past bucket:

```ts
await docNumber.next({
  entityKey: "invoice",
  at: new Date("2026-07-31T12:00:00Z"),
});
// periodKey "2026-07" — resumes July's counter, current month untouched
```

This is the mechanism for:

- **Imports** — replaying legacy documents in their original months
- **Late postings** — a document dated to a period that is still open
- **Deterministic tests** — the same `at` always yields the same rendered value for a given sequence

The date tokens and the period key come from the same instant, so a July `at` produces both `2026-07` and `INV-202607-…`. There is no way for them to disagree.

> **Backfills do not reorder.** Allocating into July after August already started appends to July's bucket at whatever value it reached. If a legacy series must keep its exact numbers, write the values directly and then seed the counter — do not try to replay them through `next()`.

## Concurrency and gaps

### What each store guarantees

| Store | Mechanism | Safe across processes |
| --- | --- | --- |
| `createMemorySequenceStore` | In-process async mutex serialising `allocateNext` | **No** |
| `createDrizzleSequenceStore` | Read-then-update on `(format_id, period_key)` | Only under a transaction with row locks |
| Custom `incrementer` (Redis `INCR`, DB sequence) | Whatever the backend guarantees | Usually yes |

The Drizzle store deliberately does **not** open its own transaction — it uses the `db` you handed it, so your app decides the boundary. Under real concurrency, wrap allocation in a transaction that locks the row:

```ts
await db.transaction(async (tx) => {
  await tx.execute(
    sql`SELECT current_value FROM doc_number_sequences
        WHERE format_id = ${formatId} AND period_key = ${periodKey}
        FOR UPDATE`,
  );

  const number = await docNumberFor(tx).next({ entityKey: "invoice" });
  await tx.insert(invoices).values({ ...input, number: number.value });
});
```

The unique index on `(format_id, period_key)` means the concurrent-insert race for a brand-new bucket ends as a constraint violation rather than two rows — retry once and the second caller reads the row that won. Full SQL, including a `MySQL` variant, is in [Stores & Drizzle](./stores.md#concurrency-recipe).

### Gaps are normal

A number is consumed the moment `allocateNext` returns. If the surrounding transaction rolls back — validation failure, payment declined, a crash — that integer is never used and the series has a hole.

| Requirement | Approach |
| --- | --- |
| "Numbers must be unique and roughly ordered" | Default behaviour; ignore gaps |
| "Numbers must be gapless" (some tax regimes) | Allocate inside the same transaction as the document insert, keep that transaction short, and never pre-allocate for drafts |
| "Drafts get a number too" | Use a separate `entityKey` for drafts (`invoice:draft`) and allocate the real number on posting |

Gapless-by-construction is a business decision with a throughput cost: it means serialising every document creation on one row lock. Decide it explicitly rather than discovering it in an audit.

## Inspecting counters

```ts
const store = createDrizzleSequenceStore({ dialect: "pgsql", db, table });

await store.getCurrent({ formatId, periodKey: "2026-08" }); // 42 | null (bucket untouched)
await store.peekNext({ formatId, periodKey: "2026-08" });   // 43 (or 1 when null)
```

`getCurrent` distinguishing `null` from `0` is what lets an admin screen say "no numbers issued yet this month" instead of a misleading zero.

## Next steps

- [Stores & Drizzle](./stores.md) — tables, dialects, locking recipe
- [Recipes](./recipes.md) — a Redis incrementer end to end
- [Concepts](./concepts.md) — how the pieces relate
