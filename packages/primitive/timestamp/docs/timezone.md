---
title: Timezone
description: IANA ids, validation, entity zone, offsets vs zones
sidebar_position: 6
---

# Timezone

Every `@eristack/timestamp` value carries **`timezone`**: an IANA time zone identifier. This page defines what is valid, how validation works, and how to pick zones in ERP apps.

## IANA, not offset

| Valid `timezone` | Invalid as persisted `timezone` |
| --- | --- |
| `UTC` | `+07:00`, `-05:00`, `0700` |
| `Asia/Jakarta` | `GMT+7` (prefer IANA) |
| `Europe/Paris` | `EST` (ambiguous abbreviations) |
| `America/New_York` | Server default from `Intl` |

**Why:** offsets change with DST; IANA ids encode the rules needed for wall mode and local date derivation.

Offsets **inside instant input strings** are allowed and normalize to UTC:

```ts
instantOf("2026-08-22T09:30:00+07:00", "Asia/Jakarta");
// instant: "2026-08-22T02:30:00Z" — offset consumed at parse
// timezone: "Asia/Jakarta" — still required for reporting
```

## Validation API

```ts
import {
  assertTimeZoneId,
  isValidTimeZoneId,
  InvalidTimeZoneError,
} from "@eristack/timestamp";

isValidTimeZoneId("Asia/Jakarta"); // true
isValidTimeZoneId("+07:00");       // false

assertTimeZoneId("Europe/Paris");  // narrows type or throws
```

Implementation:

1. Reject bare offset patterns.
2. `Intl.DateTimeFormat(undefined, { timeZone: zone })` — catches unknown ids.
3. Temporal smoke parse `1970-01-01T00:00:00[zone]` for runtime consistency.

Use at API boundaries (user settings, branch master data) **before** constructing timestamps.

## Entity timezone pattern

Multi-entity ERP apps usually store one canonical zone per reporting context:

| Master data | Field | Used for |
| --- | --- | --- |
| Company / branch | `timezone` | Default on documents |
| User preference | `timezone` | UI display override |
| Warehouse | `timezone` | Local cutoffs |

```ts
const entityTz = branch.timezone; // "Asia/Jakarta"
const posted = instantOf(payload.postedAt, entityTz);
const transactionDate = toLocalDateString(posted);
```

Do not rely on the server's OS timezone (`TZ` env, Node default).

## Instant mode: two timezone notions

Developers sometimes confuse:

| Concept | Where it lives |
| --- | --- |
| UTC instant | `instant` field |
| Reporting calendar | `timezone` field on the value |

Example: HQ in UTC posts at `2026-08-22T23:30:00Z`. Branch in Jakarta labels transaction date:

```ts
toLocalDateString(instantOf("2026-08-22T23:30:00Z", "Asia/Jakarta"));
// "2026-08-23" — next calendar day in Jakarta
```

Same instant, different label — correct.

## Wall mode: timezone defines the clock

For wall values, `timezone` **defines** what `local` means. There is no separate offset field.

```ts
wallOf("2026-09-15T09:00:00", "Europe/Paris");
// 9:00 means Paris civil time, including DST rules on that date
```

## UTC as timezone

`UTC` is valid IANA for both modes:

```ts
instantOf("2026-08-22T12:00:00Z", "UTC");
wallOf("2026-08-22T00:00:00", "UTC"); // midnight UTC calendar
```

Use deliberately — "UTC wall" is not "floating local."

## Non-DST zones

Zones without DST (e.g. `Asia/Jakarta`) simplify wall→instant but **still require wall mode** when the stored meaning is local schedule, not "already happened fact."

## Database storage (today)

Until `./drizzle`:

```sql
-- instant row
posted_at timestamptz NOT NULL,
posted_timezone varchar(64) NOT NULL,

-- wall row
due_local text NOT NULL,
due_timezone varchar(64) NOT NULL
```

Validate zone strings on insert with `assertTimeZoneId`.

## Related

- [Instant mode](./instant.md)
- [Wall mode](./wall.md)
- [Gotchas](./gotchas.md)
