---
title: API reference
description: Every export, by entry point
sidebar_position: 10
---

# API reference

Hand-maintained cheat-sheet. Signatures are simplified for reading; types ship with the package.

## Entry points

| Import | Contains | Peer dependency |
| --- | --- | --- |
| `@eristack/doc-number` | Core: format, parse, `createDocNumber`, memory stores, grid schema, errors | — |
| `@eristack/doc-number/drizzle` | Tables + stores for `pgsql` / `mysql` / `sqlite` | `drizzle-orm` |
| `@eristack/doc-number/rest` | Framework-free format CRUD + preview actions | — |
| `@eristack/doc-number/express` | Router + request/response mapping | `express` |
| `@eristack/doc-number/nest` | Module, controller, injection tokens | `@nestjs/common`, `@nestjs/core` |
| `@eristack/doc-number/client` | Fetch client for the configuration API | — |
| `@eristack/doc-number/react` | Provider, TanStack Query hooks, Form options | `react`, `@tanstack/react-query`, `@tanstack/react-form` |

## Core — `@eristack/doc-number`

### Pure functions

| Export | Signature | Notes |
| --- | --- | --- |
| `formatDocumentNumber` | `({ pattern, sequence, at? }) => string` | `at` defaults to now; UTC date parts |
| `previewDocumentNumber` | Same as above | Alias that reads better in settings code |
| `parseDocumentNumber` | `(pattern, value) => { sequence, parts }` | Anchored match; throws `ParseMismatchError` |
| `parsePattern` | `(pattern) => TokenNode[]` | Validation + tokenisation |
| `padSequence` | `(sequence, width) => string` | Rejects negative / non-integer |
| `periodKeyFor` | `(reset, at) => string` | `*` \| `2026` \| `2026-08` \| `2026-08-11` (UTC) |
| `datePartsUtc` | `(at) => { YYYY, YY, MM, DD }` | Strings, already padded |

### `createDocNumber(options)`

```ts
createDocNumber(options?: {
  formats?: FormatStore;
  sequences?: SequenceStore;
  incrementer?: Incrementer;  // replaces sequences.allocateNext for next()
  clock?: Clock;              // default () => new Date()
  idFactory?: () => string;   // default crypto.randomUUID()
}): DocNumberApi
```

Every option is optional; a method throws `MissingDependencyError` only when it actually needs a missing piece.

| Method | Signature | Notes |
| --- | --- | --- |
| `registerFormat` | `(RegisterFormatInput) => Promise<FormatRecord>` | Validates pattern; `active` (default `true`) deactivates siblings for the `entityKey` |
| `updateFormat` | `(UpdateFormatInput) => Promise<FormatRecord>` | Patch by id; `prefix: null` clears; resulting `active: true` deactivates siblings |
| `getFormat` | `(entityKey) => Promise<FormatRecord \| null>` | The **active** record |
| `getFormatById` | `(id) => Promise<FormatRecord \| null>` | Any record |
| `listFormats` | `(entityKey, query?: DataGridQueryInput) => Promise<DataGridResult<FormatRecord>>` | `createDataGrid(formatDataGridSchema).applyInMemory` over the store rows |
| `next` | `({ entityKey, at? }) => Promise<DocNumberResult>` | **Allocates.** Needs `formats` + (`sequences` or `incrementer`) |
| `peekNext` | `({ entityKey, at? }) => Promise<{ sequence, periodKey, value }>` | Read-only. **Requires `sequences`** — an incrementer cannot peek |
| `preview` | `({ pattern, sequence, at? }) => string` | Pure render; no stores touched |
| `format` | `formatDocumentNumber` | Bound pure helper |
| `parse` | `parseDocumentNumber` | Bound pure helper |

`next` and `peekNext` throw `FormatNotFoundError` when no active format exists for the `entityKey`.

### Stores and schema

| Export | Purpose |
| --- | --- |
| `createMemoryFormatStore()` | In-memory `FormatStore` |
| `createMemorySequenceStore()` | In-memory `SequenceStore` with an async mutex on `allocateNext` |
| `formatDataGridSchema` | `DataGridSchema` for `listFormats` and format grid endpoints |

`formatDataGridSchema` fields: `id`, `entityKey`, `pattern`, `reset`, `prefix`, `active`, `createdAt`, `updatedAt`. Defaults: sort `createdAt` desc, page size 50, max 100, mode `advanced`, page mode `offset`. Full table in [Formats & listing](./formats-and-listing.md#formatdatagridschema).

### Types

| Type | Shape |
| --- | --- |
| `FormatRecord` | `{ id, entityKey, pattern, reset, prefix?, active, createdAt, updatedAt }` |
| `RegisterFormatInput` | `{ entityKey, pattern, reset?, prefix?, id?, active? }` |
| `UpdateFormatInput` | `{ id, entityKey?, pattern?, reset?, prefix?: string \| null, active? }` |
| `NextDocumentNumberInput` / `PeekNextInput` | `{ entityKey, at? }` |
| `PreviewInput` / `FormatDocumentNumberInput` | `{ pattern, sequence, at? }` |
| `DocNumberResult` | `{ value, sequence, periodKey, formatId, entityKey, pattern }` |
| `ParsedDocumentNumber` | `{ sequence, parts: Record<string, string> }` |
| `ResetPeriod` | `"never" \| "yearly" \| "monthly" \| "daily"` |
| `FormatStore` | `save`, `findById`, `findActiveByEntityKey`, `listByEntityKey` |
| `SequenceStore` | `allocateNext`, `getCurrent`, `peekNext` (all keyed by `{ formatId, periodKey }`) |
| `AllocateNextInput` | `{ formatId, periodKey }` |
| `Incrementer` | `(AllocateNextInput) => Promise<number>` |
| `Clock` | `() => Date` |
| `TokenNode` | `literal` \| `YYYY` \| `YY` \| `MM` \| `DD` \| `SEQ` (with `width`) |
| `CreateDocNumberOptions` / `DocNumberApi` | Factory options and the returned API |

### Errors

All extend `DocNumberError` and carry a stable `code`:

| Class | `code` | Thrown when | HTTP |
| --- | --- | --- | --- |
| `InvalidPatternError` | `INVALID_PATTERN` | Empty / unknown tokens, zero or multiple SEQ, bad width, negative sequence | `400` |
| `ParseMismatchError` | `PARSE_MISMATCH` | Value does not match the pattern, or SEQ shorter than its width | `400` |
| `FormatNotFoundError` | `FORMAT_NOT_FOUND` | No active format for an `entityKey`, or unknown id | `404` |
| `MissingDependencyError` | `MISSING_DEPENDENCY` | Required `formats`, `sequences`, or `incrementer` not supplied | `500` |
| `DocNumberError` | (base) | Base class for `instanceof` checks | `400` |

## Drizzle — `@eristack/doc-number/drizzle`

| Export | Summary |
| --- | --- |
| `createDocNumberFormatTable(dialect, tableName?)` | Default `doc_number_formats` |
| `createDocNumberSequenceTable(dialect, tableName?)` | Default `doc_number_sequences`, with a unique index on `(format_id, period_key)` |
| `createPgsqlDocNumberFormatTable` / `Mysql…` / `Sqlite…` | Dialect-specific factories |
| `createPgsqlDocNumberSequenceTable` / `Mysql…` / `Sqlite…` | Dialect-specific factories |
| `createDrizzleFormatStore({ dialect, db, table })` | `FormatStore` (upsert by id) |
| `createDrizzleSequenceStore({ dialect, db, table, idFactory? })` | `SequenceStore` (read-then-update) |

Types: `DrizzleDialect` (`"pgsql" \| "mysql" \| "sqlite"`), `DrizzleLikeDb`, `AnyDocNumberFormatTable`, `AnyDocNumberSequenceTable`, and the per-dialect table types, plus `CreateDrizzleFormatStoreOptions` / `CreateDrizzleSequenceStoreOptions`.

## REST — `@eristack/doc-number/rest`

| Export | Summary |
| --- | --- |
| `createRestActions({ docNumber })` | All six actions in one object |
| `createListFormatsAction` | `GET /formats?entityKey=` → `{ items, pageInfo, query }` |
| `createGetActiveFormatAction` | `GET /formats/active?entityKey=` → `{ format \| null }` |
| `createGetFormatByIdAction` | `GET /formats/:id` → `{ format }` |
| `createCreateFormatAction` | `POST /formats` → `201 { format }` |
| `createUpdateFormatAction` | `PATCH /formats/:id` → `{ format }` |
| `createPreviewAction` | `POST /preview` → `{ value }` |
| `toFormatBody(record)` | `FormatRecord` → wire shape (ISO dates, `prefix` omitted when unset) |
| `toErrorResponse(error)` | Domain error → `{ status, body: { error: { code, message } } }` |

Types: `RestRequest`, `RestResponse`, `RestHeaders`, `RestErrorBody`, `RestDocNumberConfig`, `FormatBody`, `CreateFormatBody`, `UpdateFormatBody`, `PreviewBody`.

There is no allocation action — `next` / `peekNext` are core-only by design ([why](./http-and-ui.md#what-is-and-is-not-exposed)).

## Express — `@eristack/doc-number/express`

| Export | Summary |
| --- | --- |
| `createDocNumberRouter({ docNumber, paths? })` | Router with the six configuration routes |
| `toRestRequest(req, params?)` | Express `Request` → `RestRequest` |
| `applyRestResponse(res, restResponse)` | Writes status, headers, JSON body |

`paths` overrides: `formats` (`/formats`), `activeFormat` (`/formats/active`), `formatById` (`/formats/:id`), `preview` (`/preview`). Type: `ExpressDocNumberRouterOptions`.

## Nest — `@eristack/doc-number/nest`

| Export | Summary |
| --- | --- |
| `DocNumberModule.register({ docNumber, controller? })` | Synchronous registration |
| `DocNumberModule.registerAsync({ imports?, inject?, useFactory, controller? })` | Build `docNumber` from injected deps |
| `DocNumberController` | Routes under `/doc-number/*` |
| `DOC_NUMBER` | Injection token for `DocNumberApi` |
| `DOC_NUMBER_REST_CONFIG` | Injection token for `{ docNumber }` |

`controller: false` registers providers without routes. Types: `DocNumberModuleOptions`, `DocNumberModuleAsyncOptions`.

## Client — `@eristack/doc-number/client`

```ts
createDocNumberClient(config: DocNumberClientConfig): DocNumberClient
```

Config: `baseUrl` (string or getter, required), `formatsPath`, `activeFormatPath`, `formatByIdPath`, `previewPath`, `fetch`, `credentials` (default `"include"`), `getHeaders`.

| Method | Returns |
| --- | --- |
| `listFormats(entityKey, query?)` | `DataGridResult<FormatBody>` |
| `getActiveFormat(entityKey)` | `FormatBody \| null` |
| `getFormatById(id)` | `FormatBody` |
| `createFormat(input)` | `FormatBody` |
| `updateFormat(id, input)` | `FormatBody` |
| `preview(input)` | `string` |

Errors throw an `Error` with `code` and `status` attached. Types: `DocNumberClient`, `DocNumberClientConfig`, `MaybeAsync`.

## React — `@eristack/doc-number/react`

| Export | Summary |
| --- | --- |
| `DocNumberProvider` | Takes `client` **or** `clientConfig`; app owns `QueryClientProvider` |
| `useDocNumberContext()` | `{ client }`; throws outside the provider |
| `useDocNumber()` | Bound client methods, no cache |
| `useDocNumberFormats(entityKey, gridQuery?)` | List + active + create/update/preview mutations |
| `useDocNumberFormat(id)` | `useQuery` for one record |
| `createFormatFormOptions({ entityKey, onSubmit, defaultValues? })` | TanStack Form options; defaults `{ pattern: "", reset: "never", active: true }` |
| `docNumberFormatsQueryKey(entityKey, query?)` | `["eristack","doc-number","formats", entityKey, serialized]` |
| `docNumberActiveFormatQueryKey(entityKey)` | `["eristack","doc-number","formats","active", entityKey]` |

`useDocNumberFormats` returns `{ formats, pageInfo, query, active, status, error, createFormat, updateFormat, preview, refresh, listQuery, activeQuery, createMutation, updateMutation, previewMutation }`. Types: `DocNumberContextValue`, `DocNumberProviderProps`, `FormatsStatus` (`"idle" \| "loading" \| "ready" \| "error"`).
