---
title: Getting started
description: From a formatted string to a persisted, period-resetting invoice number
sidebar_position: 2
---

# Getting started

This guide climbs one step at a time: render a number with no dependencies at all, then add stores so numbers actually increment, then point at Drizzle for production.

## Installation

```bash
pnpm add @eristack/doc-number
```

Everything else is an optional peer, installed only if you use that entry:

| Entry | Peer |
| --- | --- |
| `@eristack/doc-number/drizzle` | `drizzle-orm` + your driver |
| `@eristack/doc-number/express` | `express` |
| `@eristack/doc-number/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/doc-number/react` | `react`, `@tanstack/react-query` (`@tanstack/react-form` for the form helper) |

`@eristack/data-grid` is a regular dependency — it powers `listFormats`.

## Step 1 — Format and parse, no state

The pure functions have no stores, no clock injection, and no async. They are the right tool for previews, tests, and migration scripts.

```ts
import { formatDocumentNumber, parseDocumentNumber } from "@eristack/doc-number";

formatDocumentNumber({
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  sequence: 42,
  at: new Date("2026-08-11T00:00:00.000Z"),
});
// → "INV-202608-00042"

parseDocumentNumber("INV-{YYYY}{MM}-{SEQ:5}", "INV-202608-00042");
// → { sequence: 42, parts: { YYYY: "2026", MM: "08", SEQ: "00042" } }
```

Two things to notice:

- **`at` defaults to now**, and every date token is rendered from **UTC** parts. Pass `at` explicitly in tests so results do not drift with the machine's timezone.
- **You supply the sequence.** These functions never touch a counter. That is the next step.

> **Tip:** Validate a user-entered pattern by calling `parsePattern(pattern)` (or just formatting it with a dummy sequence). An invalid pattern throws `InvalidPatternError` — see [Format DSL](./format.md).

## Step 2 — Allocate with in-memory stores

`createDocNumber` binds a **format store** (what patterns exist) and a **sequence store** (what counter each period is on).

```ts
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "@eristack/doc-number";

const docNumber = createDocNumber({
  formats: createMemoryFormatStore(),
  sequences: createMemorySequenceStore(),
});

await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
});

const first = await docNumber.next({ entityKey: "invoice" });
// { value: "INV-202608-00001", sequence: 1, periodKey: "2026-08",
//   formatId: "…", entityKey: "invoice", pattern: "INV-{YYYY}{MM}-{SEQ:5}" }

const second = await docNumber.next({ entityKey: "invoice" });
// second.sequence === 2
```

`next()` does four things in order:

1. Look up the **active** format for `entityKey` (throws `FormatNotFoundError` if there is none).
2. Compute the `periodKey` from the format's `reset` and the timestamp (`input.at`, else the injected clock).
3. Allocate the next 1-based integer for `(formatId, periodKey)`.
4. Render `pattern` and prepend `prefix` if the record has one.

The memory stores are real implementations, not stubs — `createMemorySequenceStore` serialises `allocateNext` through an async mutex — so they are fine for **unit tests and demos**. They are **useless** the moment you run two processes or deploy to **Vercel** (cold starts / multiple instances). Production: Drizzle sequence + format stores on Postgres — see [Stores](./stores.md).

## Step 3 — Peek without consuming

Settings screens and "your next invoice will be…" hints should never burn a number:

```ts
await docNumber.peekNext({ entityKey: "invoice" });
// → { sequence: 3, periodKey: "2026-08", value: "INV-202608-00003" }
```

`peekNext` reads the counter; `next` advances it. They are not interchangeable, and `peekNext` is a *hint*: by the time you render it, another request may have taken that number.

> **Important:** `peekNext` requires a `SequenceStore`. A custom `incrementer` can allocate but cannot peek, so `createDocNumber({ formats, incrementer })` throws `MissingDependencyError` on `peekNext`. Details in [Sequencing](./sequencing.md).

## Step 4 — Inspect the formats

`listFormats` returns the same `{ items, pageInfo, query }` envelope every list in the stack returns, courtesy of [`@eristack/data-grid`](/docs/data-grid):

```ts
const page = await docNumber.listFormats("invoice");
// page.items    → FormatRecord[]
// page.pageInfo → { mode: "offset", page: 1, pageSize: 50, total, totalPages, … }
// page.query    → normalized DataGridQuery

const inactive = await docNumber.listFormats("invoice", {
  mode: "advanced",
  filters: { type: "clause", field: "active", op: "eq", value: false },
  sorts: [{ field: "createdAt", dir: "desc" }],
});
```

See [Formats & listing](./formats-and-listing.md) for the full field list.

## Step 5 — Swap in Drizzle

Nothing above changes except which stores you construct:

```ts
import { createDocNumber } from "@eristack/doc-number";
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

Add both tables to your Drizzle schema so they land in a migration. Table shapes, dialects, and the row-locking recipe live in [Stores & Drizzle](./stores.md).

## Step 6 — Use it where documents are created

Allocation belongs next to the write it numbers:

```ts
export async function createInvoice(db: AppDb, input: NewInvoice) {
  return db.transaction(async (tx) => {
    const number = await docNumberFor(tx).next({ entityKey: "invoice" });

    const [invoice] = await tx
      .insert(invoices)
      .values({ ...input, number: number.value })
      .returning();

    return invoice;
  });
}
```

`docNumberFor(tx)` is a small helper that builds a `createDocNumber` bound to the transaction handle, so the store reads and writes inside the same transaction — the full version is in [Recipes](./recipes.md#recipe-monthly-invoice-numbers).

If the transaction rolls back, the allocated integer is gone — that is a burnt number, not a duplicate. Deliberate trade-off; see [Sequencing](./sequencing.md#concurrency-and-gaps).

## Where to go next

| You want to… | Read |
| --- | --- |
| Understand `entityKey`, active formats, and period buckets | [Concepts](./concepts.md) |
| Know exactly which patterns are legal | [Format DSL](./format.md) |
| Reason about resets, gaps, and races | [Sequencing](./sequencing.md) |
| Build an admin settings screen | [Formats & listing](./formats-and-listing.md) + [HTTP & UI](./http-and-ui.md) |
| Copy a working end-to-end setup | [Recipes](./recipes.md) |
