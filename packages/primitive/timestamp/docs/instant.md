---
title: Instant mode
description: UTC facts — posted_at, occurred_at, transaction_date derivation
sidebar_position: 4
---

# Instant mode

Use **`kind: "instant"`** when the business records a **fact on the global timeline**: the payment cleared, the ledger entry was posted, the goods were received.

```ts
type ZonedInstant = {
  kind: "instant";
  instant: string;   // UTC ISO ending in Z
  timezone: string;  // IANA — reporting / calendar context
};
```

## Mental model

Think of two layers:

1. **`instant`** — the atomic fact ("at this moment on Earth").
2. **`timezone`** — whose wall calendar you use to **label** that fact (`transaction_date`, fiscal reports, UI).

The timezone does **not** redefine when the event occurred. Two rows with the same `instant` but different `timezone` are the same moment; they differ only in derived local labels.

```ts
import { instantOf, toLocalDateString, toLocalParts } from "@eristack/timestamp";

const t = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");

toLocalDateString(t); // "2026-08-22"
toLocalParts(t).hour; // 9

const sameMoment = instantOf("2026-08-22T02:30:00Z", "UTC");
toLocalDateString(sameMoment); // "2026-08-22" (UTC calendar — different hour in parts)
```

## Constructors

### `instantOf(input, timezone)`

| Input | Behavior |
| --- | --- |
| ISO with `Z` | Stored as-is (normalized) |
| ISO with offset (`+07:00`) | Normalized to UTC `Z` |
| `Date` | Epoch → UTC instant (**interop only**) |
| Epoch milliseconds (`number`) | UTC instant |

```ts
instantOf("2026-08-22T09:30:00+07:00", "Asia/Jakarta");
// { kind: "instant", instant: "2026-08-22T02:30:00Z", timezone: "Asia/Jakarta" }
```

Invalid zone → `InvalidTimeZoneError`. Bad ISO → `TimestampParseError`.

### `now(timezone?)`

Current instant from injectable clock (defaults to system). Zone defaults to `"UTC"` for the **reporting** field only.

```ts
import { now, setClock, resetClock } from "@eristack/timestamp";
```

## Operations

### Timeline order — `compareInstant(a, b)`

Compares UTC instants only. Returns `-1 | 0 | 1`. Timezone fields are ignored.

Use for sorting ledger lines, audit trails, "which happened first".

### Local calendar — `toLocalDateString(ts)`

Returns `YYYY-MM-DD` in `ts.timezone`. This is the usual **`transaction_date`** display value when posting time is the source of truth.

### Full parts — `toLocalParts(ts)`

```ts
type LocalParts = {
  year: number;
  month: number;      // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};
```

Use when building custom formatters or entity-local period keys (without changing `@eristack/doc-number` UTC defaults).

### Display — `formatInstant(ts, options?)`

| `style` | Output |
| --- | --- |
| `"iso"` (default) | UTC `instant` string |
| `"date"` | Local date in zone |
| `"datetime"` | Local date-time in zone (no offset suffix) |

## ERP patterns

### Invoice header

| Column | Type | Notes |
| --- | --- | --- |
| `posted_at` | instant | When document was posted (UTC fact) |
| `entity_timezone` | IANA string | Often on company/branch master |
| `transaction_date` | derived | `toLocalDateString(posted)` — not a second source of truth unless legal requires date-only entry |

If legal requires the user to **pick** a transaction date independent of post time, model that as **wall** date at start-of-day in entity zone — see [Recipes](./recipes.md).

### Ledger `occurred_at`

`@eristack/financial-ledger` today stores ISO strings in hash payloads. Migration path:

1. Store instant JSON or normalized UTC string in hash (unchanged string sort order if ISO UTC).
2. Add optional `occurred_timezone` on app SQL rows for reporting.

### Audit `created_at`

Database `timestamptz` defaults are fine. Use instant mode when the **API** exposes timestamps with explicit zone context for multi-entity apps.

## Wire JSON

```json
{
  "kind": "instant",
  "instant": "2026-08-22T02:30:00Z",
  "timezone": "Asia/Jakarta"
}
```

Rules:

- After validation, `instant` **must** end with `Z`.
- Offset forms in input are normalized on validate.

## Anti-patterns

| Don't | Do instead |
| --- | --- |
| Store server-local `Date` in JSON | `timestampToJSON(instantOf(...))` |
| Use `instant` mode for "due at local midnight" | [Wall mode](./wall.md) |
| Omit `timezone` because instant is UTC | Always persist IANA for reporting |
| Compare with string `<` on non-normalized ISO | `compareInstant` |

## Related

- [Wall mode](./wall.md) — schedules
- [Serialization](./serialization.md) — wire rules
- [Gotchas](./gotchas.md) — DST confusion with instant mode
