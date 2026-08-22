# Decisions — @eristack/timestamp

## D1 — Two modes, discriminated union

**Decision:** `kind: "instant" | "wall"` with different primary fields.

**Rejected:** Single `{ instant, timezone }` where meaning depends on call site — too easy to mix up past vs future semantics.

## D2 — Wire/storage formats

### Instant mode

| Layer | Format |
| --- | --- |
| Canonical in-memory | Normalized UTC ISO-8601 with `Z`: `2026-08-22T09:30:00.000Z` |
| DB (Postgres) | `timestamptz` for instant + `text` IANA zone (optional but recommended for reporting context) |
| JSON REST | `{ "kind": "instant", "instant": "...Z", "timezone": "Asia/Jakarta" }` |

Instant is **always** normalized to UTC on parse. Offsets in input (`+07:00`) are accepted then normalized.

### Wall mode

| Layer | Format |
| --- | --- |
| Canonical | Local ISO **without** offset: `2026-03-30T09:00:00` (optional `.sss`) |
| DB | `text` local + `text` timezone — **do not** store as `timestamptz` if wall intent must survive DST re-reads |
| JSON REST | `{ "kind": "wall", "local": "2026-03-30T09:00:00", "timezone": "Europe/Paris" }` |

**Rejected:** Storing wall times as UTC in the primary column — that is instant mode, not wall mode.

### Date-only (future convenience)

Many ERP fields are date-only (`transaction_date` without time). Options:

- **v1:** `local` at `T00:00:00` in entity zone, still `wall` or derive from `instant`
- **v1.1:** add `kind: "date"` with `date: "2026-08-22"` + `timezone` if demand is high

Start with instant + `toLocalDate()` helper before adding a third kind.

## D3 — Timezone validation

- Validate against IANA allowlist bundled or generated (like money ISO currency list).
- Reject fixed offsets alone (`+07:00`) as `timezone` — require `Asia/Jakarta`.
- **Exception:** parse helpers may accept offset in **instant** input strings; stored timezone remains IANA.

## D4 — Engine: Temporal polyfill in core

**Decision:** `@js-temporal/polyfill` (or native Temporal when baseline allows).

| Concept | Temporal type |
| --- | --- |
| Instant mode | `Temporal.Instant` |
| Wall mode | `Temporal.PlainDateTime` + `Temporal.TimeZone` |
| Zone ops | `TimeZone.getOffsetStringFor`, `Instant.toZonedDateTimeISO` |

**Rejected for core:** Luxon (heavier), manual offset math, `Intl` alone.

**Date interop:** `instantToDate`, `dateToInstant` — documented, lossy for wall.

## D5 — Operations split by mode

### Shared

- `parseTimestamp(json | string)` — discriminated
- `formatTimestamp(ts, { style })` — display
- `validateTimezone(zone)`
- `equal(a, b)` — same kind + same canonical values

### Instant-only

- `toInstant(ts)` / `compare(a, b)` — timeline order
- `toZonedParts(ts)` — `{ year, month, day, hour, ... }` in `ts.timezone`
- `toLocalDate(ts)` — date in zone (for transaction_date labels)
- `now(timezone?)` — clock injection for tests

### Wall-only

- `wallToInstantOnce(ts, disambiguation?)` — single occurrence → UTC instant (DST gap/overlap policy explicit)
- `formatWall(ts)` — never silently attach `Z`

### Explicitly **not** v1

- `nextOccurrence(cron, ts)` — recurrence belongs in capability layer
- Fiscal period membership — `@eristack/fiscal-calendar` later

## D6 — DST disambiguation policy

When `wallToInstantOnce` hits a **gap** (spring forward) or **overlap** (fall back):

| Case | Default | Override |
| --- | --- | --- |
| Gap (non-existent local time) | Error `TimestampGapError` | `disambiguation: "earlier" \| "later"` optional |
| Overlap (two possible instants) | Error `TimestampOverlapError` | `disambiguation: "earlier" \| "later"` required |

Document in gotchas.md — same severity as money rounding rules.

## D7 — Adapter phasing (mirror money exactly)

Full adapter **design** upfront: [adapters-plan.md](./adapters-plan.md). Core **compartmentalization** upfront: [core-layout.md](./core-layout.md).

| Iteration | Ship in npm | Plan / docs |
| --- | --- | --- |
| **1** | Core `.` only | `TimestampJSON`, validate, `adapters.md` hub, `timestamp-adapters` skill skeleton |
| **2a** | `./drizzle`, `./rest`, `./zod` | Per-subpath docs with copy-paste blocks |
| **2b** | `./express`, `./nest`, `./client`, `./react` | Express/Nest → rest; React → form strings |

**Iteration 1 rule:** core exports a stable wire type (`TimestampJSON`) and validate layer so drizzle/rest/zod are thin — same as money’s `validateMoneyJSON` before adapters.

**Iteration 1 rule:** no fake subpath exports; extend `package.json` `exports` + `tsup` entries only when adapter code lands (avoid `exports:check` failures).

Peer deps optional via `peerDependenciesMeta` — same table as money (drizzle-orm, zod ^4, express, @nestjs/common, @tanstack/react-form).

Subpath spine:

```text
@eristack/timestamp → /drizzle, /rest, /zod, /express, /nest, /client, /react
/express, /nest → /rest → core/validate
/react → form strings; /client → revive JSON
```

## D8 — Relationship to doc-number UTC policy

**No breaking change to doc-number in v1.**

doc-number’s “UTC always” stays correct for sequence tokens. Future option:

```ts
periodKeyFor(reset, timestampInstant, { timezone: "Asia/Jakarta" })
```

Primitive provides `calendarPartsInZone`; doc-number decides bucket policy.

## D9 — Naming in app schemas

Recommend field names that encode mode:

| Field | Mode |
| --- | --- |
| `postedAt`, `occurredAt`, `transactionAt` | instant |
| `dueAt`, `scheduledAt`, `appointmentAt` | wall (if local intent) |

If a field is wall but named `*At`, skill docs should warn.

## D10 — Open questions (resolve before iteration 1 code)

1. **Package slug on site:** `/timestamp` vs `/datetime` — prefer `timestamp` per product language.
2. **Subpath name:** `@eristack/timestamp` root export types as `Timestamp`, `ZonedInstant`, `WallTime`.
3. **Epoch ms:** accept in parse for instant mode? (Likely yes for DB interop; canonical remains ISO string.)
4. **Minimum Temporal baseline:** polyfill only vs feature-detect native — start polyfill-only for consistency.
