---
name: timestamp-core
description: >
  Business timestamps with @eristack/timestamp: instant mode (UTC facts + IANA zone
  for local dates) and wall mode (local intent, DST-safe schedules). Use for
  transaction_date, posted_at, due_at, appointments — not raw Date timezone math.
metadata:
  type: core
  library: '@eristack/timestamp'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/primitive/timestamp/docs/getting-started.md'
---

# @eristack/timestamp — Core

Load **one** deep page after this skill when implementing:

| Task | Doc |
| --- | --- |
| Posted / occurred / transaction date from post time | `docs/instant.md` |
| Due date / appointment / local schedule | `docs/wall.md` |
| IANA validation, entity zone | `docs/timezone.md` |
| Copy-paste ERP fields | `docs/recipes.md` |
| Wire JSON / API bodies | `docs/serialization.md` |

## Pick the mode (required)

| User means | Mode | Constructor |
| --- | --- | --- |
| When it **happened** | `instant` | `instantOf(iso \| Date \| epochMs, timezone)` |
| When it **will happen** (local clock) | `wall` | `wallOf(localIso, timezone)` |

Both require **IANA** `timezone` (`Asia/Jakarta`) — never bare `+07:00` as persisted zone.

## instant — facts

```ts
import { instantOf, toLocalDateString, compareInstant } from "@eristack/timestamp";

const posted = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
toLocalDateString(posted); // transaction_date label
compareInstant(a, b);
```

- `instant` = normalized UTC with `Z`.
- `timezone` = reporting calendar — does not change the instant.

## wall — schedules / due dates

```ts
import { wallOf, wallToInstantOnce } from "@eristack/timestamp";

const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");
// List filters / due dates: compareWall, isWallInRange, addWallDays — never `new Date(wall.local)`.
wallToInstantOnce(due); // single occurrence — do not replace wall storage
```

- `local` has **no** `Z` or offset.
- **Never** persist wall intent as one-time UTC only.
- DST: `TimestampGapError` / `TimestampOverlapError` unless `disambiguation: "earlier"|"later"`.

## Wire JSON

```ts
import { parseTimestamp, timestampToJSON, validateTimestampJSON } from "@eristack/timestamp";
```

`{ kind, instant|local, timezone }` — see `docs/serialization.md`.

## Do not

- `Date.getHours()` / server TZ for business dates.
- Store recurring "9am Paris" as fixed UTC.
- Mix modes without `kind` discriminant.
- Change `@eristack/doc-number` UTC policy — adjust `at` in app if needed.

## Adapters

SQL/HTTP: `@eristack/timestamp#timestamp-adapters` → `docs/adapters.md` (subpaths ship after core).
