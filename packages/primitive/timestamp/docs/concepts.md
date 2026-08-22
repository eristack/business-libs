---
title: Concepts
description: Two modes, timezone role, Temporal policy, adapter boundaries
sidebar_position: 3
---

# Concepts

Six ideas explain almost every API decision in `@eristack/timestamp`: two explicit modes, IANA zones, Temporal in core, wire JSON first, DST as explicit errors, and adapter-ready boundaries.

## 1. Two modes — not one overloaded datetime

Business time is **two different questions**:

| Question | Mode | Stored shape |
| --- | --- | --- |
| When did it happen? | `instant` | UTC `instant` + IANA `timezone` |
| When should it happen locally? | `wall` | Local `local` + IANA `timezone` |

```ts
type Timestamp =
  | { kind: "instant"; instant: string; timezone: string }
  | { kind: "wall"; local: string; timezone: string };
```

Using one field named `instant` for both UTC facts and local schedules is a common source of DST bugs. The `kind` discriminant is load-bearing.

### Instant mode semantics

- `instant` is a **normalized UTC** ISO-8601 string ending in `Z`.
- The value identifies one point on the global timeline.
- `timezone` answers: "In which regional calendar should we **interpret** this instant?" — for `transaction_date`, period labels, UI copy.
- Changing `timezone` on an instant does **not** change the instant; it changes local **derived** parts.

### Wall mode semantics

- `local` is a **plain** datetime without offset (`2026-03-30T09:00:00`).
- The value identifies what the user sees on the clock in `timezone`.
- **Do not** silently convert wall values to UTC for primary storage if the business meaning is wall-clock (due dates, recurring local times).
- Conversion to UTC is **`wallToInstantOnce`** — named, explicit, single-occurrence.

See [Instant mode](./instant.md) and [Wall mode](./wall.md).

## 2. IANA timezone — not offset alone

`timezone` must be an **IANA time zone id** (`Asia/Jakarta`, `Europe/Paris`).

| Accepted | Rejected as `timezone` |
| --- | --- |
| `UTC` | `+07:00`, `-05:00` |
| `America/New_York` | bare numeric offsets |

Offsets in **instant input strings** are fine — they normalize to UTC on parse. Offsets are **not** a substitute for a persisted zone column.

See [Timezone](./timezone.md).

## 3. Temporal in core — Date at boundaries only

All zone-aware calendar math runs through `@js-temporal/polyfill` imported **once** in `core/engine/temporal.ts`.

| Do in core | Do at app boundary only |
| --- | --- |
| `toLocalParts`, `wallToInstantOnce` | `instantOf(new Date())` |
| DST gap/overlap detection | Legacy drivers returning `Date` |

Never use `date.getHours()`, `getMonth()`, or server local timezone for business rules.

## 4. Wire JSON is the contract

`TimestampJSON` is the canonical cross-service shape. **`validateTimestampJSON`** is the shared gate for future REST/Zod adapters — same pattern as `validateMoneyJSON` in `@eristack/money`.

Details: [Serialization](./serialization.md).

## 5. DST is explicit — not silently guessed

`wallToInstantOnce` defaults to **`reject`** on spring-forward gaps and fall-back overlaps.

| Case | Error |
| --- | --- |
| Local time does not exist | `TimestampGapError` |
| Local time exists twice | `TimestampOverlapError` |

Pass `{ disambiguation: "earlier" | "later" }` when policy requires a single instant.

## 6. Adapter-ready core (mirror `@eristack/money`)

```text
core/validate/timestamp-json.ts  ← single validation gate
future /rest, /zod               ← call validate
future /drizzle                  ← pack/unpack ↔ TimestampJSON
future /express, /nest           ← call /rest
```

Full map: [Adapters](./adapters.md).

## Raw `Date` vs this library

| Approach | Problem |
| --- | --- |
| `new Date()` everywhere | Server TZ leaks into business logic |
| UTC ISO only | Loses "transaction date in Jakarta" without zone |
| One-time UTC for "9am Paris" recurring | DST shifts local time next season |
| `timestamptz` alone for "local midnight due" | DB stores instant; user meant calendar |

## `@eristack/doc-number` (unchanged)

Doc-number period keys stay **UTC**. Derive entity-local buckets with `toLocalDateString` / `toLocalParts`, then pass an adjusted `Date` or instant to `next({ at })` when you intentionally align sequences.

## Where to go next

- [Instant mode](./instant.md)
- [Wall mode](./wall.md)
- [Recipes](./recipes.md)
- [Gotchas](./gotchas.md)
