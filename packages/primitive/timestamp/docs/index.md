---
title: "@eristack/timestamp"
description: UTC instants for facts, wall-clock for schedules — IANA timezones, DST-safe
sidebar_position: 1
---

# @eristack/timestamp

Business software constantly mixes two different questions:

1. **When did it happen?** — a fact on the global timeline (`posted_at`, `occurred_at`, GL posting time).
2. **When should it happen (in someone's local calendar)?** — user intent (`due_at`, appointment at 9:00 Paris, fiscal close at local midnight).

Conflating those into one `{ date, timezone }` shape — or worse, a bare `Date` — is how ERP systems get timezone bugs that only show up in March and November.

`@eristack/timestamp` makes the distinction **explicit in the type system**:

| Mode | Primary field | Meaning |
| --- | --- | --- |
| **`instant`** | `instant` (UTC, ends with `Z`) | Fixed point in time |
| **`wall`** | `local` (no offset, no `Z`) | Wall-clock intent in an IANA zone |

Both modes carry **`timezone`**: `Asia/Jakarta`, `Europe/Paris`, `America/New_York`.

Core uses [**Temporal**](https://tc39.es/proposal-temporal/) (`@js-temporal/polyfill`). JavaScript `Date` is for **interop at boundaries only** — not for calendar math in domain code.

## Install

```bash
pnpm add @eristack/timestamp
```

## Thirty-second example

```ts
import {
  instantOf,
  toLocalDateString,
  wallOf,
  wallToInstantOnce,
} from "@eristack/timestamp";

const posted = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
toLocalDateString(posted); // "2026-08-22"

const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");
wallToInstantOnce(due);
```

## Documentation map

| Guide | Read when |
| --- | --- |
| [Getting started](./getting-started.md) | First integration |
| [Concepts](./concepts.md) | Mental model |
| [Instant mode](./instant.md) | `transaction_date`, `posted_at` |
| [Wall mode](./wall.md) | Due dates, DST |
| [Timezone](./timezone.md) | IANA ids, validation |
| [Gotchas](./gotchas.md) | Anti-patterns |
| [Serialization](./serialization.md) | Wire JSON |
| [Recipes](./recipes.md) | ERP field patterns |
| [Adapters](./adapters.md) | Drizzle/REST/Zod plan |
| [API reference](./api-reference.md) | All exports |

## Adapter status

**Core** ships today. Subpaths (`./drizzle`, `./rest`, …) mirror `@eristack/money` — see [Adapters](./adapters.md).
