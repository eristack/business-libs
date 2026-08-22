# Core layout — compartmentalized for adapters

`@eristack/timestamp` core mirrors `@eristack/money` boundaries: **adapters never import each other**; all call into `src/core/` only.

## Directory tree (scaffold upfront in iteration 1)

```text
packages/primitive/timestamp/
  src/
    index.ts                    # export * from "./core/index.js"  (same as money)
    core/
      index.ts                  # public core barrel — only surface adapters may import
      errors/index.ts
      timezone/
        iana-data.ts            # bundled allowlist (like money iso-data)
        registry.ts             # assertTimeZoneId, isValidTimeZoneId
      engine/
        temporal.ts             # sole Temporal polyfill import site
        clock.ts                # injectable now() for tests
      instant/
        zoned-instant.ts        # ZonedInstant type + instantOf
        compare.ts
        local-parts.ts          # toLocalParts, toLocalDateString
      wall/
        wall-clock.ts           # WallClock type + wallOf
        to-instant-once.ts      # wallToInstantOnce + DST policy
      format/
        format.ts               # formatInstant, formatWall
      parse/
        parse.ts                # parseTimestamp from string | unknown
      serialize/
        json.ts                 # TimestampJSON, timestampToJSON, timestampFromJSON
      validate/
        timestamp-json.ts       # validateTimestampJSON — shared by rest + zod
    drizzle/                    # iteration 2 — files stubbed or absent until ship
      index.ts
      columns.ts
      field.ts
      pack.ts
      naming.ts
      types.ts
    rest/
      index.ts
      codec.ts                  # parseTimestampJSON → calls core/validate
      errors.ts
    zod/
      index.ts
      schemas.ts                # zTimestamp, zInstant, zWall — Zod 4
    express/
      index.ts                  # readTimestamp / sendTimestamp → rest
    nest/
      index.ts
      parse-timestamp.pipe.ts
    client/
      index.ts
      revive.ts                 # reviveTimestamp after fetch
    react/
      index.ts
      form.ts                   # TanStack Form string helpers
  tests/
    core/                       # instant, wall, dst, parse, serialize
    adapters/                   # added per adapter iteration
  docs/
    _meta.json                  # same page order pattern as money
    adapters.md                 # hub — planned iteration 1, filled iteration 2+
    drizzle.md, rest.md, zod.md, express.md, nest.md, client.md, react.md
  skills/
    timestamp-core/SKILL.md
    timestamp-adapters/SKILL.md # planned; body grows with adapters
  tsup.config.ts                # all entries listed from day 1 (adapters added as implemented)
  package.json                  # exports map lists all subpaths (like money)
```

## Import rules (hard)

| Layer | May import |
| --- | --- |
| `core/**` | `@js-temporal/polyfill` only (no drizzle, zod, express, react) |
| `drizzle/**` | `core/**`, `drizzle-orm/*` |
| `rest/**` | `core/**` only |
| `zod/**` | `core/**`, `zod` |
| `express/**` | `rest/**`, `express` |
| `nest/**` | `rest/**`, `@nestjs/common` |
| `client/**` | `core/**` only |
| `react/**` | `core/**`, `client/**` patterns, `@tanstack/react-form` |

Same spine as money: **`/express` and `/nest` never duplicate validation — they call `/rest`**. **`/react` does not replace `/client`**.

## Core modules adapters depend on

Adapters must not re-parse ISO by hand. They call these core exports only:

```ts
// serialize/json.ts + validate/timestamp-json.ts
export type TimestampJSON =
  | { kind: "instant"; instant: string; timezone: string }
  | { kind: "wall"; local: string; timezone: string };

export function timestampToJSON(ts: Timestamp): TimestampJSON;
export function timestampFromJSON(json: TimestampJSON): Timestamp;
export function validateTimestampJSON(value: unknown, path?: string): TimestampJSON;

// parse/parse.ts
export function parseTimestamp(input: unknown): Timestamp;

// instant + wall constructors (for drizzle pack/unpack)
export function instantOf(...): ZonedInstant;
export function wallOf(...): WallClock;
```

Drizzle `pack`/`unpack` use `timestampFromJSON` / `timestampToJSON` — same pattern as money `moneyField` bindings.

## tsup + exports (mirror money)

**Iteration 1:** build entry = `src/index.ts` only.

**Before iteration 2:** extend `tsup.config.ts` entries and `package.json` `exports` in the **same PR** that adds each adapter (or one PR adds all entries + all adapters — see phases).

Pre-declare in planning (not necessarily in repo until adapter PR):

```json
"exports": {
  ".": "./dist/index.js",
  "./drizzle": "./dist/drizzle/index.js",
  "./rest": "./dist/rest/index.js",
  "./zod": "./dist/zod/index.js",
  "./express": "./dist/express/index.js",
  "./nest": "./dist/nest/index.js",
  "./client": "./dist/client/index.js",
  "./react": "./dist/react/index.js"
}
```

Peer deps (all optional via `peerDependenciesMeta`), same pattern as money:

| Subpath | Peer |
| --- | --- |
| `./drizzle` | `drizzle-orm` |
| `./zod` | `zod ^4.0.0` |
| `./express` | `express` |
| `./nest` | `@nestjs/common` |
| `./react` | `@tanstack/react-form` (optional) |

## Why this makes iteration 2 boring

- Wire shape is fixed in `TimestampJSON` before Drizzle exists.
- REST codec is ~30 lines: validate + path errors (copy money `rest/codec.ts` shape).
- Zod schemas wrap `validateTimestampJSON` (copy money `zod/schemas.ts`).
- Drizzle fields map columns ↔ `TimestampJSON` without Temporal in adapter code.
- Express/Nest/React are thin re-exports of REST + form string conventions.

## Iteration 1 deliverable vs deferred

| Ship in iteration 1 | Planned, not implemented |
| --- | --- |
| Full `src/core/**` | `src/drizzle/**` … `src/react/**` |
| `TimestampJSON` + validate | Adapter tests |
| Core tests + DST matrix | `exports` subpaths beyond `.` |
| Docs: concepts, gotchas, api-reference | Per-adapter doc pages (stub titles in `_meta.json` OK) |
| `adapters.md` hub (describes future subpaths) | drizzle.md … react.md body |
| `timestamp-core` skill | `timestamp-adapters` skill (skeleton with subpath table) |

No empty adapter files that fail `exports:check` — subpaths appear when implementations land.
