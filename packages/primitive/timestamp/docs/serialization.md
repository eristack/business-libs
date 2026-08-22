---
title: Serialization
description: TimestampJSON wire contract, validation rules, round-trip
sidebar_position: 8
---

# Serialization

`TimestampJSON` is the **canonical wire shape** for HTTP bodies, event payloads, JSON columns, and future adapters. Core validates here so `/rest` and `/zod` stay thin — same design as `MoneyJSON` in `@eristack/money`.

## Type definition

```ts
type InstantJSON = {
  kind: "instant";
  instant: string;
  timezone: string;
};

type WallJSON = {
  kind: "wall";
  local: string;
  timezone: string;
};

type TimestampJSON = InstantJSON | WallJSON;
```

## Instant wire rules

| Rule | Detail |
| --- | --- |
| `kind` | Must be `"instant"` |
| `instant` | String; after validation, normalized to UTC ending in `Z` |
| Input offsets | Accepted on validate — e.g. `+07:00` → `Z` |
| `timezone` | Valid IANA (see [Timezone](./timezone.md)) |
| JSON numbers | **Rejected** for epoch in v1 — use ISO strings |

Example:

```json
{
  "kind": "instant",
  "instant": "2026-08-22T02:30:00Z",
  "timezone": "Asia/Jakarta"
}
```

## Wall wire rules

| Rule | Detail |
| --- | --- |
| `kind` | Must be `"wall"` |
| `local` | ISO local **without** `Z` or trailing offset |
| `timezone` | Valid IANA |
| Fractional seconds | Optional (`.000`) |

Example:

```json
{
  "kind": "wall",
  "local": "2026-09-15T00:00:00",
  "timezone": "Europe/Paris"
}
```

Invalid:

```json
{ "kind": "wall", "local": "2026-09-15T00:00:00Z", "timezone": "UTC" }
```

## Core functions

```ts
import {
  parseTimestamp,
  timestampFromJSON,
  timestampToJSON,
  validateTimestampJSON,
  isTimestampJSONShape,
} from "@eristack/timestamp";
```

| Function | Behavior |
| --- | --- |
| `timestampToJSON(ts)` | Typed value → canonical wire |
| `timestampFromJSON(json)` | Wire → typed (throws on bad zone/local) |
| `validateTimestampJSON(value, path?)` | Validate + normalize; throws `TimestampParseError` / `InvalidTimeZoneError` |
| `parseTimestamp(unknown)` | Accept wire or already-typed; validate + construct |
| `isTimestampJSONShape(unknown)` | Loose boolean guard (no throw) |

### Path prefix on errors

```ts
validateTimestampJSON(body.postedAt, "postedAt");
// TimestampParseError: postedAt.instant is invalid
```

Future `@eristack/timestamp/rest` maps these to HTTP field errors like money.

## Round-trip

```ts
const ts = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
const json = timestampToJSON(ts);
const back = timestampFromJSON(json);
// equalTimestamp(ts, back) === true
```

Wall:

```ts
const w = wallOf("2026-09-15T00:00:00", "Europe/Paris");
timestampFromJSON(timestampToJSON(w));
```

## Nested document example

```ts
type InvoiceDTO = {
  id: string;
  postedAt: TimestampJSON;
  dueAt: TimestampJSON;
};

function hydrateInvoice(dto: InvoiceDTO) {
  return {
    ...dto,
    postedAt: parseTimestamp(dto.postedAt),
    dueAt: parseTimestamp(dto.dueAt),
  };
}
```

## Database JSON column

Postgres `jsonb` example until `./drizzle`:

```sql
posted_at jsonb NOT NULL,
due_at jsonb NOT NULL
```

Write `timestampToJSON` on insert; read `parseTimestamp` on select. Index timeline fields with generated column on `(posted_at->>'instant')` if needed.

## Client revive (future `./client`)

Pattern will mirror money:

```ts
// future
import { reviveTimestamp } from "@eristack/timestamp/client";
reviveTimestamp(fetchResult.postedAt);
```

Today: `parseTimestamp` in app code.

## Versioning

Adding fields to wire JSON in future requires:

1. Backward-compatible readers (`kind` discriminant preserved).
2. Changeset + migration notes.
3. Do not overload `kind` values without major bump policy.

## Related

- [Instant mode](./instant.md)
- [Wall mode](./wall.md)
- [Adapters](./adapters.md)
