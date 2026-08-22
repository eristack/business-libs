# Adapters plan — mirror @eristack/money

Full adapter design upfront. Implementation follows money’s subpaths, docs, and dependency spine.

## Subpath map (target)

```text
@eristack/timestamp                      core — ZonedInstant, WallClock, parse, compare, calendar parts
        │
        ├── /drizzle                     SQL columns, pack/unpack, naming (instant + wall fields)
        ├── /rest                        parseTimestampJSON / serializeTimestamp (no router)
        ├── /zod                         Zod 4 schemas (peer zod ^4)
        ├── /express                     readTimestamp / sendTimestamp → /rest
        ├── /nest                        ParseTimestampPipe → /rest
        ├── /client                      reviveTimestamp after fetch (no React)
        └── /react                       TanStack Form string helpers → /client patterns
```

Core never imports Drizzle, Express, Nest, React, or Zod.

## Three representations (like money wire vs SQL vs hash)

| Layer | Instant mode | Wall mode | Adapter |
| --- | --- | --- | --- |
| **Wire / API / contracts** | `{ kind, instant, timezone }` | `{ kind, local, timezone }` | [REST](./rest.md) · [Zod](./zod.md) |
| **HTTP frameworks** | Same JSON on `req.body` / DTO | Same | [Express](./express.md) · [Nest](./nest.md) |
| **Browser fetch** | Revive JSON → `Timestamp` | Same | [Client](./client.md) |
| **TanStack Form** | String ISO in field state | Local string + hidden zone | [React](./react.md) |
| **App SQL tables** | `timestamptz` + `timezone text` | `local text` + `timezone text` | [Drizzle](./drizzle.md) |
| **Hash-chained ledger** | ISO instant string in payload (today) | Rare — document as instant when posted | Core serialize — **not** Drizzle |

Wire rules live in core `serialize/json.ts` + `validate/timestamp-json.ts` (same split as money `moneyToJSON` + `validateMoneyJSON`).

---

## `./drizzle` — mirror `money/drizzle`

**Exports (planned):**

```ts
export { instantField, wallField, timeZoneField } from "./field.js";
export { packInstant, unpackInstant, packWall, unpackWall } from "./pack.js";
export type { TimestampDialect, InstantFieldBinding, WallFieldBinding } from "./types.js";
export { defaultInstantSuffix, defaultWallSuffix, defaultZoneSuffix } from "./naming.js";
```

### Field modes

| Mode | SQL columns | Use |
| --- | --- | --- |
| **Instant paired** | `{logical}_at` (`timestamptz`) + `{logical}_timezone` (`varchar`) | `posted_at`, `occurred_at`, `transaction_at` |
| **Wall paired** | `{logical}_local` (`text`, ISO local) + `{logical}_timezone` (`varchar`) | `due_at`, `scheduled_at` |
| **Shared timezone** | One `timezone` per row + multiple instant/wall fields | Document header zone |

| Dialect | Instant column | Wall local | Timezone |
| --- | --- | --- | --- |
| `pgsql` | `timestamp with time zone` or `timestamptz` | `text` | `varchar(64)` |
| `mysql` | `datetime(3)` stored UTC convention documented | `text` | `varchar(64)` |
| `sqlite` | `text` (ISO UTC) | `text` | `text` |

Production default dialect: **`"pgsql"`** (stack-defaults).

### Bindings (like `moneyField`)

```ts
const postedAt = instantField("pgsql", "postedAt", {
  mode: "instantPaired",
  timezoneColumn: "postedTimezone", // or shared document timezone
});

const dueAt = wallField("pgsql", "dueAt", {
  mode: "wallPaired",
  timezoneColumn: "dueTimezone",
});
```

`binding.pack(rowValues) → Timestamp`, `binding.unpack(ts) → column map`.

**Corruption rule:** never set instant/wall/local columns without timezone through bindings — same as money amount/currency pairing.

---

## `./rest` — mirror `money/rest`

**Exports:**

```ts
export function isTimestampJSON(value: unknown): value is TimestampJSON;
export function serializeTimestamp(ts: Timestamp): TimestampJSON;
export function parseTimestampJSON(value: unknown, path?: string): Timestamp;
export function parseTimestampFields(body: unknown, fields: readonly string[]): Record<string, Timestamp>;
export function serializeTimestampFields(values: Record<string, Timestamp | null | undefined>): Record<string, TimestampJSON | null | undefined>;
export { RestTimestampFieldError } from "./errors.js";
```

Implementation: delegate to `validateTimestampJSON` + `timestampFromJSON`; wrap `TimestampParseError` → `RestTimestampFieldError` (copy money error mapping).

No Express/Nest imports.

---

## `./zod` — mirror `money/zod` (Zod 4 only)

**Exports:**

```ts
import { z } from "zod";

export const zTimeZoneId: z.ZodString;
export const zInstantJSON: z.ZodType<TimestampJSON & { kind: "instant" }>;
export const zWallJSON: z.ZodType<TimestampJSON & { kind: "wall" }>;
export const zTimestampJSON: z.ZodType<TimestampJSON>;
export const zTimestamp: z.ZodType<Timestamp>; // transform via timestampFromJSON
export const zInstant: z.ZodType<ZonedInstant>;
export const zWall: z.ZodType<WallClock>;
```

Peer: `zod ^4.0.0`. Import `"zod"` only — stack-defaults policy.

Schemas call core validate, not duplicate ISO regex in Zod-only land.

---

## `./express` — mirror `money/express`

**Exports:**

```ts
export function readTimestamp(req: Request, field: string): Timestamp;
export function readTimestamps(req: Request, fields: readonly string[]): Record<string, Timestamp>;
export function sendTimestamp(res: Response, field: string, value: Timestamp): void;
// or body helper consistent with money readMoney/sendMoney naming
```

Thin wrapper over `parseTimestampFields` / `serializeTimestamp`.

---

## `./nest` — mirror `money/nest`

**Exports:**

```ts
export class ParseTimestampPipe implements PipeTransform { ... }
// Optional: ParseInstantPipe / ParseWallPipe if product wants strict DTO fields
```

Pipe calls `parseTimestampJSON` from `/rest`.

---

## `./client` — mirror `money/client`

**Exports:**

```ts
export function reviveTimestamp(value: unknown): Timestamp | null;
export function reviveTimestamps<T extends Record<string, unknown>>(obj: T, keys: readonly (keyof T)[]): T;
```

After `fetch`, JSON objects → core `Timestamp` instances (not `Date`).

---

## `./react` — mirror `money/react`

**Exports:**

```ts
export type TimestampFormValue =
  | { kind: "instant"; instant: string; timezone: string }
  | { kind: "wall"; local: string; timezone: string };

export function timestampFormDefaults(ts: Timestamp): TimestampFormValue;
export function timestampFromForm(value: TimestampFormValue): Timestamp;
export function instantFormFieldName(base: string): string;
export function wallFormFieldName(base: string): string;
```

TanStack Form: plain strings in field state (like money `{ currency, amount }`). Optional peer `@tanstack/react-form`.

UI maps `datetime-local` ↔ wall `local` + separate zone select — document in react.md.

---

## Docs mirror (package `docs/_meta.json`)

Same sidebar pattern as money:

```json
{
  "pages": [
    "index",
    "getting-started",
    "concepts",
    "gotchas",
    "instant",
    "wall",
    "serialization",
    "adapters",
    "drizzle",
    "rest",
    "zod",
    "express",
    "nest",
    "client",
    "react",
    "api-reference"
  ]
}
```

| Doc | Content |
| --- | --- |
| `adapters.md` | Hub — subpath map, install peers, corruption rules (iteration 1) |
| `serialization.md` | `TimestampJSON` wire shape (iteration 1) |
| `drizzle.md` … `react.md` | Copy-paste blocks per adapter (iteration 2–3) |
| `gotchas.md` | DST gaps, never store wall as UTC, never use Date.getHours for zones |

---

## Skills mirror

| Skill | When |
| --- | --- |
| `@eristack/timestamp#timestamp-core` | Constructors, instant vs wall choice, DST |
| `@eristack/timestamp#timestamp-adapters` | Subpath table → single `adapters.md` source |

`timestamp-adapters` skill body: actionable subpath table + corruption rules; `sources` → `docs/adapters.md` only (docs-depth-tokens).

---

## ai-knowledge recipes (when shipped)

| Recipe id | Triggers | Skills |
| --- | --- | --- |
| `timestamp-instant` | transaction date, posted at, occurred at | timestamp-core |
| `timestamp-wall` | due date, scheduled, appointment, local midnight | timestamp-core |
| `timestamp-persist` | drizzle timestamp columns, timezone sql | timestamp-adapters |

---

## Corruption rules (all adapters — like money)

1. **Instant wire:** `instant` must normalize to UTC `Z` — reject ambiguous local strings without offset in instant mode.
2. **Wall wire:** `local` must not include `Z` or offset — that is instant mode.
3. **SQL:** pack/unpack through Drizzle bindings — do not write `timestamptz` from wall local strings silently.
4. **Timezone:** IANA only in persisted columns — not `+07:00` alone.
5. **Display:** `Date` in UI is interop only — revive through `/client` or core parse.
6. **Ledger hash payloads:** keep ISO instant strings in hashed JSON until a versioned migration; primitive documents read/hydrate pattern like financial-ledger + money.

---

## Implementation order (after core)

| PR | Subpaths | Docs |
| --- | --- | --- |
| 2a | `./drizzle`, `./rest`, `./zod` | drizzle, rest, zod |
| 2b | `./express`, `./nest`, `./client`, `./react` | express, nest, client, react |

Can be one PR if small enough (money shipped all adapters in one train).

Each PR: `pnpm build`, `exports:check`, adapter tests, `timestamp-adapters` skill update, changeset.
