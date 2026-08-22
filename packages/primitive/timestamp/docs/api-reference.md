---
title: API reference
description: Complete core export reference for @eristack/timestamp
sidebar_position: 11
---

# API reference

Root export `@eristack/timestamp` only (adapters documented in [Adapters](./adapters.md)).

## Types

### `TimeZoneId`

```ts
type TimeZoneId = string; // IANA, e.g. "Asia/Jakarta"
```

### `ZonedInstant`

```ts
type ZonedInstant = {
  readonly kind: "instant";
  readonly instant: string; // UTC ISO ending in Z
  readonly timezone: TimeZoneId;
};
```

### `WallClock`

```ts
type WallClock = {
  readonly kind: "wall";
  readonly local: string; // ISO without offset
  readonly timezone: TimeZoneId;
};
```

### `Timestamp`

```ts
type Timestamp = ZonedInstant | WallClock;
```

### `TimestampJSON` / `InstantJSON` / `WallJSON`

Wire shapes — see [Serialization](./serialization.md).

### `LocalParts`

```ts
type LocalParts = {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};
```

### `Disambiguation`

```ts
type Disambiguation = "earlier" | "later";
```

### `FormatInstantOptions`

```ts
type FormatInstantOptions = {
  style?: "iso" | "date" | "datetime";
  locale?: string; // reserved for future formatting
};
```

---

## Constructors

### `instantOf(input, timezone): ZonedInstant`

| Param | Type | Notes |
| --- | --- | --- |
| `input` | `string \| Date \| number` | ISO, interop Date, or epoch ms |
| `timezone` | `TimeZoneId` | Reporting context |

Throws: `InvalidTimeZoneError`, `TimestampParseError`.

### `wallOf(local, timezone): WallClock`

| Param | Type | Notes |
| --- | --- | --- |
| `local` | `string \| LocalParts` | No `Z`/offset on string form |
| `timezone` | `TimeZoneId` | Defines local clock |

Throws: `InvalidTimeZoneError`, `TimestampParseError`.

### `now(timezone?: TimeZoneId): ZonedInstant`

Default timezone `"UTC"`. Uses injectable clock.

---

## Instant operations

### `compareInstant(a, b): -1 | 0 | 1`

UTC timeline order. Timezone ignored.

### `toLocalParts(ts): LocalParts`

Calendar parts in `ts.timezone`.

### `toLocalDateString(ts): string`

`YYYY-MM-DD` in `ts.timezone`.

### `formatInstant(ts, options?): string`

| `style` | Result |
| --- | --- |
| `iso` | `ts.instant` |
| `date` | Local date |
| `datetime` | Local ISO without offset |

### `normalizeInstantString(value): string`

Asserts `Z` suffix; used internally after Temporal normalize.

### `isZonedInstant(value): value is ZonedInstant`

---

## Wall operations

### `wallToInstantOnce(ts, options?): ZonedInstant`

| Option | Default | Effect |
| --- | --- | --- |
| `disambiguation` | `reject` (via Temporal) | `earlier` / `later` on overlap/gap policy |

Throws: `TimestampGapError`, `TimestampOverlapError`, `TimestampParseError`.

### `formatWall(ts): string`

Returns `ts.local`.

### `isWallClock(value): value is WallClock`

---

## Parse and equality

### `parseTimestamp(input): Timestamp`

Accepts `TimestampJSON`, typed values, or compatible objects.

### `tryParseTimestamp(input): Timestamp | null`

Non-throwing parse.

### `isTimestamp(value): value is Timestamp`

### `equalTimestamp(a, b): boolean`

Same `kind` and canonical field equality.

---

## Serialization

### `timestampToJSON(ts): TimestampJSON`

### `timestampFromJSON(json): Timestamp`

### `validateTimestampJSON(value, path?): TimestampJSON`

Validates shape, IANA zone, normalizes instant to `Z`.

### `isTimestampJSONShape(value): value is TimestampJSON`

Non-throwing loose guard.

---

## Timezone

### `isValidTimeZoneId(zone): zone is TimeZoneId`

### `assertTimeZoneId(zone): asserts zone is TimeZoneId`

Throws `InvalidTimeZoneError`.

---

## Clock (tests)

### `setClock(fn: () => Temporal.Instant): void`

### `resetClock(): void`

---

## Errors

| Class | `name` | When |
| --- | --- | --- |
| `TimestampError` | base | — |
| `TimestampParseError` | parse | Invalid ISO, bad wire |
| `TimestampGapError` | gap | Wall in DST gap |
| `TimestampOverlapError` | overlap | Wall ambiguous |
| `InvalidTimeZoneError` | zone | Bad IANA |

All extend `TimestampError` → `Error`.

---

## Module layout (for contributors)

```text
src/core/
  engine/temporal.ts      — sole Temporal import
  instant/                — ZonedInstant
  wall/                   — WallClock, wallToInstantOnce
  serialize/json.ts       — TimestampJSON
  validate/timestamp-json.ts
  parse/parse.ts
  timezone/registry.ts
  format/format.ts
  now.ts
```

Adapters will live in `src/drizzle`, `src/rest`, … — see [Adapters](./adapters.md).
