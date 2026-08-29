---
title: Wall mode
description: Local intent — due dates, appointments, DST gaps and overlaps
sidebar_position: 5
---

# Wall mode

Use **`kind: "wall"`** when the business meaning is **what the clock says in a place**, not a pre-converted UTC instant:

- Payment due **local midnight** on the 15th
- Meeting at **9:00** in Paris
- Store hours / appointment slots
- User-entered "due date" without timezone shift on save

```ts
type WallClock = {
  kind: "wall";
  local: string;     // ISO without Z or offset
  timezone: string;  // IANA
};
```

## Why wall mode exists

### The DST problem

Suppose a user schedules **every Monday at 9:00 Europe/Paris**.

If you convert "next Monday 9:00" to UTC once and store only UTC:

- After spring DST, the **local** time drifts (9:00 becomes 8:00 or 10:00 wall clock).
- "Due on the 15th at 00:00 local" can display as the 14th or 16th in another zone if you round-trip through UTC carelessly.

**Wall mode** persists the user's calendar intent: `local: "2026-06-15T09:00:00"` + `timezone: "Europe/Paris"`. UTC is derived only when you need a single fire time (`wallToInstantOnce`), not as the canonical stored meaning.

### Instant mode is wrong for this

Instant mode says: "this already happened at one point on the timeline." Due dates and recurring local schedules are **not** that — they are constraints on local civil time.

## Constructors — `wallOf(local, timezone)`

### String form

```ts
import { wallOf } from "@eristack/timestamp";

wallOf("2026-09-15T00:00:00", "Europe/Paris");
wallOf("2026-06-15T09:00:00", "Europe/Paris");
```

**Rejected:**

```ts
wallOf("2026-09-15T00:00:00Z", "Europe/Paris");       // TimestampParseError
wallOf("2026-09-15T00:00:00+02:00", "Europe/Paris"); // use instant mode instead
```

### Parts form (forms)

```ts
wallOf(
  {
    year: 2026,
    month: 9,
    day: 15,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  },
  "Europe/Paris",
);
```

## Single occurrence — `wallToInstantOnce(ts, options?)`

Converts one wall time to **instant mode** for a single scheduler tick, reminder, or "when is this due in UTC right now?"

```ts
import { wallToInstantOnce } from "@eristack/timestamp";

const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");
const fireAt = wallToInstantOnce(due);
// ZonedInstant — use once; keep `due` as wall in DB
```

### Default: reject ambiguous local times

| DST case | Example (America/New_York) | Default |
| --- | --- | --- |
| **Gap** — local time never existed | `2025-03-09T02:30:00` (spring forward) | `TimestampGapError` |
| **Overlap** — local time twice | `2026-11-01T01:30:00` (fall back) | `TimestampOverlapError` |

### Explicit policy — `disambiguation`

```ts
wallToInstantOnce(overlap, { disambiguation: "earlier" });
wallToInstantOnce(overlap, { disambiguation: "later" });
```

Earlier/later refer to the **UTC instant**, not the wall label (wall label stays the same in overlap cases).

## Recurring and schedulers

The core library does **not** ship cron/recurrence — that belongs in app or a future capability.

Recommended pattern:

1. **Persist** recurrence rule + wall anchor (`local` + `timezone`).
2. For each occurrence, compute the next local datetime string.
3. Call **`wallToInstantOnce`** for that occurrence when enqueueing a job.

Never persist only the first occurrence's UTC if the product language is "every Monday 9:00 Paris."

## Winter vs summer — same wall, different UTC

```ts
const winter = wallOf("2026-01-06T09:00:00", "Europe/Paris");
const summer = wallOf("2026-06-15T09:00:00", "Europe/Paris");

wallToInstantOnce(winter).instant; // different UTC
wallToInstantOnce(summer).instant; // different UTC
// both represent 09:00 local in Paris on their respective dates
```

## ERP patterns

### Payment terms "Net 30 calendar days"

Business rule lives in app logic. Store **due** as wall:

```ts
const due = wallOf("2026-10-15T00:00:00", entityTimezone);
```

Not `posted_at.plus(30 days)` in UTC unless legal explicitly says UTC days.

### Appointments

Store wall + timezone. Display `formatWall(ts)` or local parts. Convert to instant only for calendar export to external systems that require UTC — document that export as lossy policy.

## Wire JSON

```json
{
  "kind": "wall",
  "local": "2026-09-15T00:00:00",
  "timezone": "Europe/Paris"
}
```

Never add `Z` or offset to `local`.

## Planned SQL ( `./drizzle` )

| Column | Type | Notes |
| --- | --- | --- |
| `due_local` | `text` | ISO local |
| `due_timezone` | `varchar(64)` | IANA |

Do **not** map wall intent into `timestamptz` without an explicit, documented conversion at read time.

## Anti-patterns

| Don't | Do |
| --- | --- |
| `wallOf("...", "UTC")` for "UTC midnight due" unless truly UTC calendar | Be explicit — often still wall with `UTC` zone |
| Store wall as UTC in API | `kind: "wall"` on wire |
| Use `wallToInstantOnce` then discard wall | Keep wall for display/editing |
| Default overlap to "compatible" silently | Pass `disambiguation` or show UI |

## Compare and calendar arithmetic

List filters (ETD between two dates, jobs departing this week) must not parse wall `local` strings through `Date` — that shifts days in US browsers.

```ts
import {
  addWallDays,
  compareWall,
  compareWallDates,
  isWallInRange,
  sortWallClocks,
  wallOf,
} from "@eristack/timestamp";

const etd = wallOf("2026-09-04", "Asia/Jakarta");
const weekStart = wallOf("2026-09-01", "Asia/Jakarta");
const weekEnd = wallOf("2026-09-07", "Asia/Jakarta");

compareWall(etd, weekStart); // 1 when etd is later
compareWallDates(etd, weekStart); // alias — same result
isWallInRange(etd, weekStart, weekEnd); // true — inclusive on both ends
sortWallClocks([weekEnd, etd, weekStart]); // ascending by civil time in zone

// Invoice due date = invoice wall date + payment terms (calendar days)
addWallDays(wallOf("2026-09-24", "Asia/Jakarta"), 14);
// { kind: "wall", local: "2026-10-08", timezone: "Asia/Jakarta" }
```

`compareWall` and `isWallInRange` require the **same IANA timezone** on all operands — mixed zones throw rather than silently convert.

## Related

- [Instant mode](./instant.md)
- [Timezone](./timezone.md)
- [Gotchas](./gotchas.md)
