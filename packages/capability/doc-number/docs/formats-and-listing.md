---
title: Formats & listing
description: register, update, read, and list formats on the data-grid envelope
sidebar_position: 6
---

# Formats & listing

Everything on this page is **configuration**: creating a series, editing it, and rendering an admin table of the ones that exist. None of it allocates a number.

## `registerFormat`

```ts
const record = await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",   // default "never"
  prefix: "ACME/",    // optional
  active: true,       // default true
  id: undefined,      // optional; otherwise generated
});
```

| Input | Required | Default | Notes |
| --- | --- | --- | --- |
| `entityKey` | Yes | — | Opaque; see [Concepts](./concepts.md#1-entitykey--the-opaque-routing-key) |
| `pattern` | Yes | — | Validated immediately; throws `InvalidPatternError` |
| `reset` | No | `"never"` | `never` \| `yearly` \| `monthly` \| `daily` |
| `prefix` | No | none | Prepended to rendered values, not parsed |
| `active` | No | `true` | When true, **deactivates every other active format** for the same `entityKey` |
| `id` | No | `idFactory()` | Supply your own to make registration idempotent |

Ids come from `crypto.randomUUID()` unless you inject an `idFactory` into `createDocNumber` — useful when you want prefixed ids (`fmt_…`) or deterministic ids in tests:

```ts
let n = 0;
const docNumber = createDocNumber({
  formats,
  sequences,
  idFactory: () => `fmt_${++n}`,
});
```

`createdAt` and `updatedAt` are stamped from the injected clock.

## `updateFormat`

A patch, keyed by id. Only the fields you pass change.

```ts
await docNumber.updateFormat({
  id: record.id,
  pattern: "INV-{YYYY}{MM}-{SEQ:6}",
  reset: "monthly",
  prefix: null,     // clears the prefix
  active: true,     // deactivates siblings
  entityKey: undefined,
});
```

| Behaviour | Detail |
| --- | --- |
| Unknown id | Throws `FormatNotFoundError` (`No document format with id "…"`) |
| `pattern` supplied | Validated before anything is written |
| `prefix: undefined` | Left as-is |
| `prefix: null` | **Cleared** |
| Result is `active: true` | Sibling active formats for the record's `entityKey` are deactivated |
| `entityKey` changed | The record moves to the new key; sibling deactivation applies to the **new** key |
| `updatedAt` | Always refreshed from the clock |

> **Changing `pattern` does not restart the counter.** Sequences are keyed by `formatId`, so editing a record keeps its series running. Register a *new* format when you want to start over at 1.

## Reading a single format

```ts
await docNumber.getFormat("invoice");   // active record for the key, or null
await docNumber.getFormatById(formatId); // any record, or null
```

`getFormat` returns `null` rather than throwing, so settings screens can render an empty state. `next()` and `peekNext()` are the strict paths — they throw `FormatNotFoundError`.

When several records are somehow active for one key (a hand-edited database, a failed migration), the store returns the most recently updated one. Normal writes through `registerFormat` / `updateFormat` keep the invariant.

## `listFormats`

```ts
listFormats(
  entityKey: string,
  query?: DataGridQueryInput,
): Promise<DataGridResult<FormatRecord>>
```

The implementation is one line of intent: load every record for the key from the store, then hand it to [`@eristack/data-grid`](/docs/data-grid).

```ts
createDataGrid(formatDataGridSchema).applyInMemory(rows, query);
```

In-memory is the right call here — one entity key owns a handful of formats, not a table worth of rows. You get filtering, sorting, and paging without a second SQL round trip, and the result is the same envelope as every other list in the stack:

```ts
const page = await docNumber.listFormats("invoice");

page.items;    // FormatRecord[]
page.pageInfo; // { mode: "offset", page: 1, pageSize: 50, total, totalPages, hasNext, hasPrev }
page.query;    // normalized DataGridQuery — echo it back to the UI
```

### The query is validated

`query` is a `DataGridQueryInput`: a query string, `URLSearchParams`, a router search object, or a plain object. It is checked against `formatDataGridSchema`, so unknown fields and operators fail closed with `InvalidQueryError` / `InvalidOperatorError` instead of being silently dropped.

```ts
await docNumber.listFormats("invoice", {
  mode: "advanced",
  filters: {
    type: "group",
    logic: "and",
    children: [
      { type: "clause", field: "active", op: "eq", value: true },
      { type: "clause", field: "reset", op: "in", value: ["monthly", "yearly"] },
    ],
  },
  sorts: [{ field: "updatedAt", dir: "desc" }],
  page: { mode: "offset", page: 1, pageSize: 20 },
});

// free-text across searchable fields
await docNumber.listFormats("invoice", { mode: "search", q: "INV-" });
```

## `formatDataGridSchema`

Exported from the root entry so servers, clients, and tests all validate against the same allow-list.

```ts
import { formatDataGridSchema } from "@eristack/doc-number";
```

| Field | Type | Filterable | Sortable | Searchable |
| --- | --- | --- | --- | --- |
| `id` | `string` | Yes | Yes | Yes |
| `entityKey` | `string` | Yes | Yes | Yes |
| `pattern` | `string` | Yes | Yes | Yes |
| `reset` | `enum` (`never`, `yearly`, `monthly`, `daily`) | Yes | Yes | No |
| `prefix` | `string` | Yes | Yes | Yes |
| `active` | `boolean` | Yes | Yes | No |
| `createdAt` | `date` | Yes | Yes | No |
| `updatedAt` | `date` | Yes | Yes | No |

Schema defaults:

| Setting | Value | Effect |
| --- | --- | --- |
| `defaultSorts` | `[{ field: "createdAt", dir: "desc" }]` | Newest format first when the caller sends no sorts |
| `defaultPageSize` | `50` | Most entity keys fit on one page |
| `maxPageSize` | `100` | Clamps oversized `pageSize` |
| `defaultMode` | `"advanced"` | Structured filters unless `mode=search` is requested |
| `defaultPageMode` | `"offset"` | `pageInfo` carries `total` / `totalPages` for classic pagers |

Search mode ORs a `contains` across the searchable fields (`id`, `entityKey`, `pattern`, `prefix`) — enough for "find the format containing `PO`" in a settings table.

> **`prefix` may be absent.** It is optional on `FormatRecord`, so filter with `isNull` / `isNotNull` rather than comparing to an empty string.

## Over HTTP

The REST layer exposes exactly these operations — list, active, by id, create, update, preview — and nothing that allocates. `GET /formats` forwards the whole query string to `listFormats`, so the data-grid params work unchanged:

```bash
curl -sG "$API/doc-number/formats" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'entityKey=invoice' \
  --data-urlencode 'mode=advanced' \
  --data-urlencode 'filters={"type":"clause","field":"active","op":"eq","value":true}' \
  --data-urlencode 'sorts=[{"field":"updatedAt","dir":"desc"}]' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

Wiring, bodies, status codes, and the React hooks are in [HTTP & UI adapters](./http-and-ui.md).

## Next steps

- [HTTP & UI adapters](./http-and-ui.md) — expose this API to a settings screen
- [Stores & Drizzle](./stores.md) — where the records live
- [Data Grid docs](/docs/data-grid) — the full query language
