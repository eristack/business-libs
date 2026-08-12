---
title: API reference
description: Public exports cheat-sheet for @eristack/doc-number
sidebar_position: 6
---

# API reference

Hand-maintained cheat-sheet. Signatures are simplified.

## Core (`@eristack/doc-number`)

| Export | Summary |
| --- | --- |
| `formatDocumentNumber({ pattern, sequence, at? })` | Render a number |
| `parseDocumentNumber(pattern, value)` | Best-effort parse → `{ sequence, parts }` |
| `previewDocumentNumber` / `api.preview` | Alias of format |
| `createDocNumber({ formats?, sequences?, incrementer?, clock? })` | Stateful API |
| `createMemoryFormatStore` / `createMemorySequenceStore` | In-memory stores |
| `parsePattern` / `padSequence` / `periodKeyFor` | Lower-level helpers |

### `createDocNumber` methods

| Method | Summary |
| --- | --- |
| `registerFormat` | Create a format (active deactivates siblings for `entityKey`) |
| `updateFormat` | Patch pattern / reset / prefix / active / entityKey |
| `getFormat` / `getFormatById` / `listFormats` | Read formats |
| `next` / `peekNext` | Allocate or preview next sequence |
| `format` / `parse` / `preview` | Bound pure helpers |

### Types

`FormatRecord`, `FormatStore`, `SequenceStore`, `Incrementer`, `ResetPeriod`, `DocNumberResult`, `RegisterFormatInput`, `UpdateFormatInput`

### Errors

`DocNumberError`, `InvalidPatternError`, `ParseMismatchError`, `FormatNotFoundError`, `MissingDependencyError`

## Drizzle (`@eristack/doc-number/drizzle`)

| Export | Summary |
| --- | --- |
| `createDocNumberFormatTable(dialect)` | Default `doc_number_formats` |
| `createDocNumberSequenceTable(dialect)` | Default `doc_number_sequences` |
| `createDrizzleFormatStore({ dialect, db, table })` | `FormatStore` |
| `createDrizzleSequenceStore({ dialect, db, table })` | `SequenceStore` |

Dialects: `pgsql` \| `mysql` \| `sqlite`.

## REST / Express / Nest / client / React

| Entry | Summary |
| --- | --- |
| `/rest` | `createRestActions({ docNumber })` format CRUD + preview |
| `/express` | `createDocNumberRouter({ docNumber })` |
| `/nest` | `DocNumberModule.register` / `registerAsync`, `DOC_NUMBER` |
| `/client` | `createDocNumberClient({ baseUrl, getHeaders? })` |
| `/react` | `DocNumberProvider`, `useDocNumber`, `useDocNumberFormats` |

See [HTTP & React adapters](./adapters.md) for paths and auth guidance.
