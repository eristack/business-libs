---
title: Edge cases
description: Mode mixing, invalid ops, empty pages, and other sharp edges
sidebar_position: 8
---

# Edge cases

These are the behaviors that surprise teams when wiring real screens. Fail closed on the wire; stay predictable in the UI.

## Advanced and search never mix

| Mode | Applied | Ignored |
| --- | --- | --- |
| `advanced` | `filters` tree | `q` / `search` |
| `search` | `q` → OR `contains` on `searchable` fields | `filters` |

Parse **normalizes** by mode: an advanced query does not keep a leftover `search` string, and a search query drops `filters`. Product UIs that show a search box *and* facet chips must **switch mode** (and clear the inactive side) so the URL matches what the user sees.

```ts
// Wrong mental model: "AND my facets with the search box"
// Right: pick one mode for this request
controller.commitSearch();  // mode → search
// or
controller.commitFilters(); // mode → advanced
```

When `mode` is omitted, `schema.defaultMode` applies (`advanced` if unset).

## Invalid queries fail closed

`parse` / middleware / Nest pipe throw `InvalidQueryError` (HTTP **400**) for:

| Input | Typical message |
| --- | --- |
| Unknown field | Field is not filterable / sortable |
| Bad operator for use | Unsupported or unknown op |
| Malformed filter JSON | Invalid filters |
| Bad `mode` | must be `"advanced"` or `"search"` |
| Page size over `maxPageSize` | Clamped or rejected per parse rules |

Do not silently ignore unknown params — that is how “why didn’t my filter apply?” bugs appear. Map errors with `toDataGridErrorResponse`:

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Field \"secret\" is not filterable"
  }
}
```

## Valueless operators

`isNull`, `isNotNull`, `isEmpty`, `isNotEmpty` must not require a value. Draft filter rows in React use `VALUELESS_OPS` so the value input can hide. Committing a row with an incomplete field/op skips that row rather than inventing a clause.

## Empty result pages

An empty `items` array is a valid success:

```ts
{
  items: [],
  pageInfo: {
    mode: "offset",
    page: 3,
    pageSize: 20,
    total: 12,
    totalPages: 1,
    hasNext: false,
    hasPrev: true,
  },
  query: { /* echoed */ },
}
```

Common causes:

- **Page past the end** — user was on page 3, then filters tightened `total`. Prefer resetting to page 1 on filter/search/sort commit (the React controller does this).
- **Genuine zero matches** — show empty state; do not treat as 404.
- **Cursor exhausted** — `hasNext: false`, `nextCursor` null/omitted.

UI should key empty-state copy off `pageInfo.total === 0` vs `items.length === 0 && page > 1`.

## Default sorts and empty sorts

If the client sends no sorts, `defaultSorts` from the schema apply. An explicit empty sort list may clear to unsorted depending on parse path — prefer always sending an intentional sort from the UI (`sortBy`) so SQL plans stay stable.

## Offset vs cursor

| | Offset | Cursor |
| --- | --- | --- |
| Best for | Admin tables, jump-to-page | Infinite scroll, stable walks |
| `pageInfo` | `total`, `totalPages`, `hasNext`/`hasPrev` | `nextCursor` / `prevCursor`, `hasNext` |
| Drizzle helper | First-class in `executeDrizzleList` | Items + inferred `hasNext`; keyset SQL is app-owned if you need true keyset |

Mixing pagination modes mid-session without resetting cursors/page produces confusing URLs. Commit paths that change filters should clear cursor / reset page.

### Cursor stability (tie-breaker column)

Keyset / cursor walks stay stable only when the sort is **total** — duplicate sort keys need a deterministic tie-breaker (usually the primary key):

| Sort | Stable? | Fix |
| --- | --- | --- |
| `createdAt desc` only | No — ties reorder between pages | Add `id asc` as secondary sort |
| `createdAt desc`, `id asc` | Yes | Encode both fields in cursor payload |
| Offset page 2 after insert | Drift | Prefer cursor for live feeds |

When building cursors in SQL, include every sort column in the keyset predicate (`WHERE (created_at, id) < ($1, $2)`). The library serializes cursor tokens from committed sorts; apps must mirror the same order in Drizzle/keyset SQL.

## Draft vs committed (React)

Typing in draft search or filter rows **does not** fetch. Only commit actions update the query key. Edge cases:

| Mistake | Effect |
| --- | --- |
| Binding the search input to committed `q` only | Every keystroke refetches (or fights the draft) |
| Calling `commitFilters` with incomplete rows | Incomplete rows skipped — user thinks a filter applied |
| Forgetting `syncDraftFromCommitted` on modal open | Draft shows stale rows from last edit |
| Using `list.query` for the modal while editing | Modal jumps as fetches complete |

See [HTTP & UI](./http-and-ui.md#draft--commit-lifecycle).

## Schema vs SQL projection mismatch

If the schema allows `customerName` but the Drizzle projection does not expose that column, parse succeeds and SQL fails (or filters the wrong expression). Treat schema field names as a **contract with your projection**, not with the physical table. See [Database](./database.md).

## In-memory vs SQL parity

`applyInMemory` and `executeDrizzleList` share the same query type, but string matching can differ slightly (JS `includes` vs SQL `LIKE`/`ILIKE`). Prefer the same mode and ops in tests for both paths when a package supports both (e.g. jwt-auth sessions vs orders).

## Large `in` / `between` values

Very large `in` lists hurt URLs and query planners. Cap in the product UI; the library validates shape, not business limits. Money filters should use **minor units** (integers) on the wire — do not send `"19.99"` into a `number` field typed as minor.

## Related

- [Querying](./querying.md) — operators and pagination reference
- [Concepts](./concepts.md) — mode model
- [Recipes](./recipes.md) — UI patterns that avoid these edges
