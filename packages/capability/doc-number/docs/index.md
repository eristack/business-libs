---
title: Introduction
description: Document numbers — token patterns, period resets, and sequence allocation
sidebar_position: 1
---

# @eristack/doc-number

Every business app eventually grows an invoice number. Then a purchase order number, a receipt number, a credit note number. Each one needs the same things: a human-readable pattern (`INV-202608-00042`), a counter that resets on some calendar boundary, a guarantee that two concurrent requests never get the same value, and a settings screen where finance can change the pattern without a deploy.

That problem gets rewritten in every product, usually badly — a `count(*) + 1` here, a `Date.now()` suffix there, a numbering rule buried in a controller.

`@eristack/doc-number` is the shared version: a small token DSL, a period-aware sequence allocator, optional persistence, and headless adapters for the settings UI. Your app keeps ownership of the database, the auth, and the form widgets.

## The two halves of the problem

Numbering looks like one feature but is really two, with very different risk profiles:

| Half | Question | Who calls it | Frequency |
| --- | --- | --- | --- |
| **Allocation** | "What number does *this* invoice get?" | Your domain service, inside the transaction that creates the document | Every document |
| **Format configuration** | "What should invoice numbers look like?" | An admin settings screen | Rarely |

The package treats them separately, and that split explains almost every API decision below.

> **Design rule.** The HTTP and React adapters expose **format configuration only**. `next()` and `peekNext()` are deliberately *not* HTTP endpoints. Allocating a number is a side effect that belongs in the same transaction as the document it numbers — not behind a REST call that a browser can retry, race, or abandon halfway.

## Layers

```text
@eristack/doc-number                 core
        │  formatDocumentNumber / parseDocumentNumber
        │  createDocNumber → registerFormat / next / peekNext / listFormats
        │  memory FormatStore + SequenceStore
        │
        ├── /drizzle                 doc_number_formats + doc_number_sequences
        ├── /rest                    framework-free format CRUD + preview
        │     ├── /express           createDocNumberRouter
        │     └── /nest              DocNumberModule + controller
        └── /client                  fetch wrapper for the config API
              └── /react             TanStack Query hooks + Form option factory
```

Core never imports Express, Nest, React, or Drizzle. Adapters never invent a second numbering dialect.

## Mental model

```text
FormatRecord                       ← one active format per entityKey
  { entityKey, pattern, reset, prefix?, active }
        │
        ▼
next({ entityKey, at? })
        │
        ├─ periodKeyFor(reset, at, timezone?) → "*" | "2026" | "2026-08" | "2026-08-11"
        ├─ allocate(formatId, periodKey) → 1-based integer (SequenceStore or Incrementer)
        └─ formatDocumentNumber(pattern, sequence, at) → prefix + rendered value
        │
        ▼
DocNumberResult
  { value, sequence, periodKey, formatId, entityKey, pattern }
```

## What you get

- **A token DSL** — `{YYYY}`, `{YY}`, `{MM}`, `{DD}`, `{SEQ}` / `{SEQ:n}`, with literals anywhere outside braces
- **Period resets** — `never`, `yearly`, `monthly`, `daily`; optional IANA `timezone` on formats; optional `scope` per branch
- **Round-tripping** — `parseDocumentNumber` recovers the sequence and date parts from a rendered value
- **Pluggable storage** — memory stores for tests, Drizzle stores for `pgsql` / `mysql` / `sqlite`, or your own
- **A pluggable allocator** — swap in Redis `INCR` through `incrementer` without touching the rest
- **Format listing on the standard envelope** — `listFormats` returns a `DataGridResult` from [`@eristack/data-grid`](/docs/data-grid)
- **Headless settings adapters** — REST / Express / Nest / client / React, with no auth and no UI opinions

## Design decisions

| Decision | Why |
| --- | --- |
| Token **strings**, not structured config | Finance teams recognise `INV-{YYYY}{MM}-{SEQ:5}`; it survives a copy-paste into a spreadsheet |
| `entityKey` is **opaque** | `"invoice"` in a single-tenant app, `"tenant:acme:invoice"` in a multi-tenant one — the library never parses it |
| **One active format** per `entityKey` | Activating a format deactivates its siblings, so `next()` never has to guess |
| Sequences keyed by `(formatId, periodKey)` | A reset opens a *new* bucket instead of overwriting the old counter; history stays auditable |
| `incrementer` **replaces** `allocateNext` | Lets you move allocation to Redis or a DB sequence while keeping the rest of the API |
| Prefix lives on the **record**, not the pattern | It is a display concern that changes independently of tokens; `prefix: null` clears it |
| Dialect is spelled **`pgsql`** | Matches [`@eristack/jwt-auth`](/docs/jwt-auth) and the rest of the stack |

## Injection rule

The package never opens a database connection, reads `process.env`, or invents an API base URL. You pass in:

- store instances (or a Drizzle `db` plus tables) to `createDocNumber`
- a pre-built `docNumber` to the REST / Express / Nest adapters
- `baseUrl`, `fetch`, and `getHeaders` to the client
- a `QueryClientProvider` around the React hooks

## Out of scope

- **Exotic tokens** (`{BRANCH}`, `{RANDOM}`) — put literals in the pattern, or compose the value yourself
- **Distributed locking** beyond what your store provides — see the concurrency notes in [Sequencing](./sequencing.md)
- **Auth and UI** — mount routers behind your own middleware; the React layer ships hooks, not widgets
- **Gap-free guarantees** — a rolled-back transaction can burn a number; if regulators require gapless series, allocate inside the same transaction and never pre-allocate

## Next steps

- [Getting started](./getting-started.md) — format a string, then allocate a real number
- [Concepts](./concepts.md) — `entityKey`, active formats, period buckets, allocators
- [Format DSL](./format.md) — tokens, validation, parse semantics
- [Sequencing](./sequencing.md) — resets, `next` vs `peekNext`, concurrency
- [Formats & listing](./formats-and-listing.md) — CRUD and the data-grid schema
- [Stores & Drizzle](./stores.md) — tables, dialects, row locking
- [HTTP & UI adapters](./http-and-ui.md) — REST, Express, Nest, client, React
- [Recipes](./recipes.md) — monthly invoices, tenants, Redis, admin screens
- [API reference](./api-reference.md) — every export
