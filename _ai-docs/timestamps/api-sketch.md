# API sketch — @eristack/timestamp (iteration 1 core)

Illustrative API; names may shift slightly during implementation.

## Types

```ts
/** IANA timezone id, e.g. Asia/Jakarta */
export type TimeZoneId = string;

export type ZonedInstant = {
  readonly kind: "instant";
  /** Normalized UTC ISO-8601 ending in Z */
  readonly instant: string;
  readonly timezone: TimeZoneId;
};

export type WallClock = {
  readonly kind: "wall";
  /** Local ISO-8601 without offset */
  readonly local: string;
  readonly timezone: TimeZoneId;
};

export type Timestamp = ZonedInstant | WallClock;

export type Disambiguation = "earlier" | "later";

export type LocalParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};
```

## Constructors

```ts
/** Parse ISO with offset/Z → instant mode; timezone = reporting context */
export function instantOf(
  input: string | Date | number,
  timezone: TimeZoneId,
): ZonedInstant;

/** Wall clock from local parts or local ISO string */
export function wallOf(
  local: string | LocalParts,
  timezone: TimeZoneId,
): WallClock;

/** Test clock — default timezone optional for display helpers */
export function now(timezone?: TimeZoneId): ZonedInstant;
```

## Parse / serialize

```ts
export function parseTimestamp(input: unknown): Timestamp;
export function timestampToJSON(ts: Timestamp): Timestamp; // canonical form
export function isTimestamp(value: unknown): value is Timestamp;
```

## Instant operations

```ts
export function compareInstant(a: ZonedInstant, b: ZonedInstant): -1 | 0 | 1;

/** Calendar parts in ts.timezone — for transaction_date, period buckets */
export function toLocalParts(ts: ZonedInstant): LocalParts;

/** YYYY-MM-DD in ts.timezone */
export function toLocalDateString(ts: ZonedInstant): string;

export function formatInstant(
  ts: ZonedInstant,
  options?: { style?: "iso" | "date" | "datetime"; locale?: string },
): string;
```

## Wall operations

```ts
/**
 * Single occurrence only. DST gap/overlap → errors unless disambiguation set.
 */
export function wallToInstantOnce(
  ts: WallClock,
  options?: { disambiguation?: Disambiguation },
): ZonedInstant;

export function formatWall(ts: WallClock): string;
```

## Validation

```ts
export function assertTimeZoneId(zone: string): asserts zone is TimeZoneId;
export function isValidTimeZoneId(zone: string): boolean;
```

## Errors

```ts
export class TimestampError extends Error {}
export class TimestampParseError extends TimestampError {}
export class TimestampGapError extends TimestampError {}      // spring forward gap
export class TimestampOverlapError extends TimestampError {}  // fall back overlap
export class InvalidTimeZoneError extends TimestampError {}
```

## Usage examples

### Transaction date (happened)

```ts
import { instantOf, toLocalDateString } from "@eristack/timestamp";

const posted = instantOf("2026-08-22T02:30:00.000Z", "Asia/Jakarta");
// UI label in entity zone
const transactionDate = toLocalDateString(posted); // "2026-08-22"
```

### Payment due (will happen — local midnight)

```ts
import { wallOf, wallToInstantOnce } from "@eristack/timestamp";

const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");
// One-shot: when does this exact local moment occur?
const dueInstant = wallToInstantOnce(due);
```

### Recurring “9am Paris” (store wall; convert per occurrence in app)

```ts
const standup = wallOf("2026-01-06T09:00:00", "Europe/Paris");
// Recurrence engine (future capability) takes WallClock + rule;
// each occurrence calls wallToInstantOnce with shifted local date.
```

## Drizzle sketch (iteration 2a — see adapters-plan.md)

```ts
import { instantField, wallField } from "@eristack/timestamp/drizzle";

instantField("pgsql", "postedAt", { timezoneColumn: "postedTimezone" });
wallField("pgsql", "dueAt", { timezoneColumn: "dueTimezone" });
```

## Zod sketch (iteration 2a, Zod 4)

```ts
import { zTimestamp, zInstant, zWall } from "@eristack/timestamp/zod";
```

## JSON wire (core iteration 1; rest/client iteration 2a)

Same shape as `timestampToJSON` — no implicit `Date` revival without `@eristack/timestamp/client`.
