---
name: doc-number-core
description: >
  Pure @eristack/doc-number: token patterns ({YYYY}/{YY}/{MM}/{DD}/{SEQ:n}),
  formatDocumentNumber, parseDocumentNumber, createDocNumber, registerFormat,
  updateFormat, listFormats, getFormatById, next, peekNext, preview, ResetPeriod,
  FormatStore, SequenceStore, Incrementer, memory stores. Use for document
  numbers without HTTP or Drizzle.
metadata:
  type: core
  library: '@eristack/doc-number'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/capability/doc-number/docs/index.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/getting-started.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/concepts.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/format.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/sequencing.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/formats-and-listing.md'
  - 'eristack/business-libs:packages/capability/doc-number/docs/api-reference.md'
  - 'eristack/business-libs:packages/capability/doc-number/src/core/create-doc-number.ts'
  - 'eristack/business-libs:packages/capability/doc-number/src/core/types.ts'
---

# @eristack/doc-number — Core

Business-only document number primitives. No HTTP or Drizzle in this entry.

## Setup

```ts
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
  formatDocumentNumber,
} from "@eristack/doc-number";

formatDocumentNumber({
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  sequence: 42,
  at: new Date("2026-08-11T00:00:00.000Z"),
});

const docNumber = createDocNumber({
  formats: createMemoryFormatStore(),
  sequences: createMemorySequenceStore(),
});

await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
});

const next = await docNumber.next({ entityKey: "invoice" });
```

## Patterns

- Tokens: `{YYYY}`, `{YY}`, `{MM}`, `{DD}`, `{SEQ}` / `{SEQ:n}` (width 1–32)
- Exactly one SEQ token required
- Reset: `never` | `yearly` | `monthly` | `daily` → period keys `*`, `2026`, `2026-08`, `2026-08-11` (UTC default)
- Optional `timezone` on format (IANA, e.g. `Asia/Jakarta`) — `{YYYY}`/`periodKey` use that zone; omit for UTC
- Optional `scope` on `next()` / `peekNext()` — per-branch counters; `{SCOPE}` token in pattern

## Custom incrementer

```ts
createDocNumber({
  formats,
  sequences, // optional; needed for peekNext
  incrementer: async ({ formatId, periodKey }) => myAllocator(formatId, periodKey),
});
```

When `incrementer` is set, it replaces `sequences.allocateNext`.

## Errors

- `InvalidPatternError`, `ParseMismatchError`, `FormatNotFoundError`, `MissingDependencyError`
