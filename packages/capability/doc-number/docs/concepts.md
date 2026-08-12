---
title: Concepts
description: entityKey, active formats, period buckets, prefixes, clocks, and allocators
sidebar_position: 3
---

# Concepts

Six ideas carry the whole package. Learn them once and every method signature becomes predictable.

## 1. `entityKey` — the opaque routing key

`entityKey` answers *"numbers for what?"*. It is a plain string the library stores, compares, and never interprets.

| Product shape | Typical `entityKey` |
| --- | --- |
| Single tenant, one series per document type | `"invoice"`, `"purchase-order"`, `"receipt"` |
| Multi-tenant | `"tenant:acme:invoice"` |
| Per branch or per legal entity | `"co:se-01:invoice"` |
| Per year-scoped series with different patterns | `"invoice:export"`, `"invoice:domestic"` |

Because the library treats it as a blob, **you** decide the separator and the hierarchy. The only rule that matters is consistency: `next({ entityKey })` matches exactly, with no prefix or wildcard semantics.

> **Pick the granularity that matches the counter you want.** Two entity keys never share a sequence. If Acme and Globex must not see each other's invoice numbers, put the tenant in the key — not in a `WHERE` clause you hope to remember.

## 2. The active format

A `FormatRecord` is the stored definition of a series:

```ts
type FormatRecord = {
  id: string;
  entityKey: string;
  pattern: string;      // "INV-{YYYY}{MM}-{SEQ:5}"
  reset: ResetPeriod;   // "never" | "yearly" | "monthly" | "daily"
  prefix?: string;      // prepended to the rendered value
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

An `entityKey` may own many records — last year's pattern, a draft of next year's — but **at most one is active**, and that is the one `next()` uses.

The library enforces this on write rather than trusting callers:

```ts
await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}-{SEQ:6}",
  reset: "yearly",
});
// active defaults to true → every other active format for "invoice" is set to active: false
```

The same happens on `updateFormat` whenever the resulting record is active. Deactivated siblings are updated in place (their `updatedAt` moves), never deleted — the old pattern stays available for parsing historical numbers.

| Method | Reads |
| --- | --- |
| `getFormat(entityKey)` | The **active** record, or `null` |
| `getFormatById(id)` | Any record, active or not |
| `listFormats(entityKey, query?)` | All records for the key, as a `DataGridResult` |

If `next()` or `peekNext()` finds no active record, it throws `FormatNotFoundError` (`code: "FORMAT_NOT_FOUND"`). That is a configuration bug, not a runtime condition to swallow.

> **Switching patterns mid-year.** Registering a new active format starts a **fresh counter**, because sequences are keyed by `formatId`. If you want continuity, update the existing record's `pattern` instead of creating a new one.

## 3. Period buckets

A reset does not zero a counter — it opens a new one. Every sequence row is keyed by `(formatId, periodKey)`, and `periodKey` is derived from the format's `reset` and the allocation timestamp:

| `reset` | `periodKey` | Meaning |
| --- | --- | --- |
| `never` | `*` | One counter forever |
| `yearly` | `2026` | New counter each UTC year |
| `monthly` | `2026-08` | New counter each UTC month |
| `daily` | `2026-08-11` | New counter each UTC day |

```ts
import { periodKeyFor } from "@eristack/doc-number";

periodKeyFor("monthly", new Date("2026-08-11T23:30:00Z")); // "2026-08"
```

Because old buckets are kept, allocating with a past `at` resumes that period's counter instead of corrupting the current one — useful for backfills and imports.

> **UTC, always.** Both `periodKeyFor` and the `{YYYY}`/`{MM}`/`{DD}` tokens read UTC calendar parts. An invoice created at `2026-08-31T23:00:00-05:00` (local September 1st in some places) lands in the `2026-09` bucket. If your business must close periods on local midnight, shift the date yourself and pass the adjusted `at`. Never rely on server timezone.

## 4. Pattern vs prefix

The pattern is the token program. The prefix is a plain string glued in front of the rendered result:

```ts
formatDocumentNumber({ pattern: "{YYYY}-{SEQ:4}", sequence: 7, at }); // "2026-0007"
// with prefix "ACME/" on the record → "ACME/2026-0007"
```

Why keep them separate?

- The prefix is usually **environmental** (tenant code, branch, `TEST-`) and changes independently of the numbering scheme.
- Prefixes never take part in parsing. `parseDocumentNumber(pattern, value)` matches the pattern only, so strip the prefix before parsing a stored value.
- `prefix` is optional. On `updateFormat`, `undefined` leaves it untouched and **`null` clears it** — the one place in the API where `null` and `undefined` differ.

```ts
await docNumber.updateFormat({ id, prefix: "ACME/" }); // set
await docNumber.updateFormat({ id, reset: "yearly" }); // prefix untouched
await docNumber.updateFormat({ id, prefix: null });    // cleared
```

## 5. The clock and `at`

Time enters through exactly two doors:

```ts
const docNumber = createDocNumber({
  formats,
  sequences,
  clock: () => new Date("2026-08-11T00:00:00Z"), // default: () => new Date()
});

await docNumber.next({ entityKey: "invoice", at: someDate }); // wins over the clock
```

Resolution order is `input.at` → `clock()` → (for the standalone `formatDocumentNumber`) `new Date()`. The same instant feeds both the period key and the date tokens, so a number can never render `2026-09` while incrementing the `2026-08` counter.

Inject a fixed clock in tests. Use `at` for backfills and for "post this document to last month" flows.

## 6. `SequenceStore` vs `Incrementer`

Two ways to produce the integer, with different capabilities:

```ts
interface SequenceStore {
  allocateNext(input: { formatId: string; periodKey: string }): Promise<number>;
  getCurrent(input: { formatId: string; periodKey: string }): Promise<number | null>;
  peekNext(input: { formatId: string; periodKey: string }): Promise<number>;
}

type Incrementer = (input: { formatId: string; periodKey: string }) => Promise<number>;
```

| | `SequenceStore` | `Incrementer` |
| --- | --- | --- |
| Surface | Three methods | One function |
| Powers `next()` | Yes | Yes — **and takes precedence** when both are supplied |
| Powers `peekNext()` | Yes | **No** |
| Typical implementation | Memory, Drizzle, your own table | Redis `INCR`, a database sequence, a vendored counter service |

Precedence is deliberate: pass both and `next()` goes through the incrementer while `peekNext()` still works off the store.

```ts
const docNumber = createDocNumber({
  formats,
  sequences,                                  // keeps peekNext alive
  incrementer: ({ formatId, periodKey }) =>
    redis.incr(`docnum:${formatId}:${periodKey}`),
});
```

With neither, `next()` throws `MissingDependencyError` (`"createDocNumber requires sequences (SequenceStore) or incrementer"`). With an incrementer but no store, `peekNext()` throws the same error class with a message that says peeking is unsupported.

> **Keep the two in sync.** If Redis allocates and Postgres peeks, they will drift. Either pick one source of truth, or treat the peeked value as decoration only.

## Putting it together

```text
entityKey ──► FormatStore.findActiveByEntityKey ──► FormatRecord
                                                        │
                        reset ────────────────────────┐ │
                        at / clock ───────────────────┴─┴──► periodKey
                                                        │
                    (formatId, periodKey) ──► Incrementer ?? SequenceStore.allocateNext
                                                        │
                                                    sequence (1-based)
                                                        │
                        pattern + at + sequence ────────┴──► formatDocumentNumber
                                                        │
                                    prefix + rendered ──┴──► DocNumberResult.value
```

## Next steps

- [Format DSL](./format.md) — what the pattern may contain
- [Sequencing](./sequencing.md) — resets, peeking, concurrency
- [Formats & listing](./formats-and-listing.md) — CRUD around `FormatRecord`
