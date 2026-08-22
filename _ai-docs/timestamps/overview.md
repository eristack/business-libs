# @eristack/timestamp — overview

Primitive for **business time** with two explicit semantics. Replaces ad hoc `Date`, raw ISO strings, and “hope the server TZ is right” across capabilities.

## Problem today

| Package | How dates work | Gap |
| --- | --- | --- |
| doc-number | UTC-only `Date` for tokens + period keys | Local fiscal close = caller hacks `at` |
| financial-ledger / hash-chained-ledger | `occurredAt` as ISO string | No timezone context for reporting |
| valuations | `receivedAt` / `expiresAt` ISO strings, string sort | No wall-clock / DST-safe scheduling |
| qups | Audit `createdAt` only | No `transaction_date` primitive |

No shared parse/format/validate, no Drizzle/Zod adapter story (unlike `@eristack/money`).

## Core idea (your model, made type-safe)

Two **modes** — same shape at a glance, different meaning for the primary field:

| Mode | Primary field | Meaning | Typical use |
| --- | --- | --- | --- |
| **`instant`** | `instant` (UTC) | A fixed point on the global timeline | `transaction_date`, `posted_at`, `occurred_at`, audit “when it happened” |
| **`wall`** | `local` (no offset) | Wall-clock intent in a zone | Appointments, “9:00 Paris”, payment due local midnight, recurring schedules |

Both carry **`timezone`**: IANA name (`Asia/Jakarta`, `Europe/Paris`).

```ts
type Timestamp =
  | { kind: "instant"; instant: string; timezone: string }
  | { kind: "wall"; local: string; timezone: string };
```

**Do not** reuse one field name (`instant`) for both semantics — that is how DST bugs get shipped.

### Why `wall` exists (ChatGPT is right here)

If you store “Monday 9:00 in Paris” by converting once to UTC:

- Spring DST: “9:00 Paris” is not the same UTC offset as winter.
- Recurring rules anchored in UTC drift in **local** time after DST transitions.
- “Due on the 15th at local midnight” must not become the 14th or 16th in another zone when rendered.

**Wall mode** persists the user’s calendar/clock intent. Conversion to UTC is an **explicit, named operation** (`wallToInstantOnce`, `nextOccurrence`, etc.) — never silent persistence.

**Instant mode** persists the fact. Timezone is for **interpretation** (display, local date parts, fiscal bucketing), not for redefining the instant.

### JS `Date` policy

Same stance as money vs JS numbers:

- **Core business logic:** Temporal (polyfill initially), not `Date` arithmetic.
- **`Date` at boundaries only:** interop, legacy adapters, “give me something the UI can feed to `input[type=datetime-local]`” — always through named helpers with documented lossiness.

Never `getHours()` / `getMonth()` for timezone-aware calendar parts.

## Package placement

- **Layer:** primitive (`packages/primitive/timestamp`)
- **Name:** `@eristack/timestamp` (npm). Folder slug: `timestamp`.
- **Pattern:** mirror `@eristack/money` — compartmentalized `src/core/` + same eight adapter subpaths. Details: [core-layout.md](./core-layout.md), [adapters-plan.md](./adapters-plan.md).
- **Not in v1:** fiscal calendar, payment terms, recurrence engine — those are **capabilities** that *consume* this primitive.

### Iterations

1. **Core** — published `.` only; ship `TimestampJSON` + validate so adapters stay thin
2. **2a** — `./drizzle`, `./rest`, `./zod`
3. **2b** — `./express`, `./nest`, `./client`, `./react`
4. **Later** — consumer migrations (ledger, valuations, doc-number)

Roadmap already mentions fiscal calendar as a later primitive; timestamp is the foundation.

## Consumers ( eventual, not v1 scope )

| Consumer | Likely mode | Notes |
| --- | --- | --- |
| Ledger `occurredAt` | `instant` | Keep hash payload stable; add timezone column optional |
| Valuations `receivedAt` / FEFO `expiresAt` | `instant` | Sort by instant, display in org zone |
| Invoices `transaction_date` | `instant` + zone → local **date** | Often date-only display |
| Payment due / appointments | `wall` | DST-safe |
| doc-number period keys | stays UTC in v1 | Optional later: `periodKeyFor(ts, reset)` using primitive |
| TanStack Form fields | adapters | string wire like money JSON |

## ai-knowledge (when implemented)

- Recipe: `timestamp-instant`, `timestamp-wall`, `timestamp-persist`
- Skills: `timestamp-core`, `timestamp-adapters`
- Stack default note: business timestamps via `@eristack/timestamp`, not raw `Date`

## Success criteria

1. Agent can implement `transaction_date` and `due_at` without guessing UTC vs local.
2. Drizzle columns documented in one canonical adapter page.
3. DST regression tests for Paris, US Eastern, and a non-DST zone (e.g. `Asia/Jakarta`).
4. `pnpm exports:check` + `pnpm knowledge:check` green on ship.
