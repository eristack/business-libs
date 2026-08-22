# Implementation phases — @eristack/timestamp

Plan-only. No package scaffold until phase 0 sign-off.

## Phase 0 — Sign-off

- [x] Package name `@eristack/timestamp`
- [x] Two-mode model (`instant` vs `wall`, separate field names)
- [x] Temporal polyfill in core
- [x] Iteration 1 ships **core only**, but core is **compartmentalized** for adapters (`TimestampJSON`, validate, instant/wall folders) — see [core-layout.md](./core-layout.md)
- [x] Adapters planned upfront to mirror `@eristack/money` — see [adapters-plan.md](./adapters-plan.md)

## Phase 1 — Core primitive (first PR)

**Goal:** Ship working core **and** freeze adapter boundaries so iteration 2 is mechanical (mirror `@eristack/money`).

See [core-layout.md](./core-layout.md) and [adapters-plan.md](./adapters-plan.md).

**Scaffold** (copy money layout — core only in dist, adapter-ready folders documented):

```
packages/primitive/timestamp/
  src/core/          # full implementation — see core-layout.md
  src/index.ts       # export * from core only
  tests/core/
  docs/              # index, getting-started, concepts, gotchas, serialization, adapters.md hub
  skills/timestamp-core/SKILL.md
  skills/timestamp-adapters/SKILL.md   # skeleton: subpath table, sources → adapters.md
  ticket.yaml
  package.json       # exports: "." only until adapters land
  tsup.config.ts     # entry: src/index.ts only (extend when adding subpaths)
```

**Core compartmentalization (required in phase 1):**

- `serialize/json.ts` + `validate/timestamp-json.ts` — **`TimestampJSON` wire type** before any adapter exists
- `engine/temporal.ts` — **only** file importing `@js-temporal/polyfill`
- `instant/` and `wall/` — separate folders, no shared mutable state
- Public barrel `core/index.ts` — stable surface for future `drizzle/pack.ts` and `rest/codec.ts`

**Deliver:**

- Types + errors
- IANA zone validation (generated/bundled list)
- `instantOf`, `wallOf`, `parseTimestamp`, `timestampToJSON`, `validateTimestampJSON`
- `compareInstant`, `toLocalParts`, `toLocalDateString`
- `wallToInstantOnce` with DST gap/overlap errors
- `now()` with injectable clock in test helpers
- DST regression tests: `Europe/Paris`, `America/New_York`, `Asia/Jakarta`
- Docs: `adapters.md` hub (planned subpaths), `serialization.md` (wire JSON)
- Skill skeleton for `timestamp-adapters` pointing at hub doc

**Not in phase 1 dist:** `./drizzle`, `./rest`, … — no stub exports that fail `exports:check`.

**ai-knowledge:**

- `recipes.yaml`: `timestamp-instant`, `timestamp-wall` ( `timestamp-persist` when drizzle ships)
- `pnpm knowledge:sync`
- Changeset: `@eristack/timestamp` minor (first publish from `0.0.0`)

**CI:** build, test, exports:check, knowledge:check

## Phase 2 — Persistence + wire adapters (mirror money 2a)

**Subpaths:** `./drizzle`, `./rest`, `./zod`

- Extend `tsup.config.ts` + `package.json` exports in **same PR**
- Implement per [adapters-plan.md](./adapters-plan.md)
- Tests under `tests/adapters/`
- Docs: `drizzle.md`, `rest.md`, `zod.md` with copy-paste blocks
- Recipe: `timestamp-persist`
- Flesh out `timestamp-adapters` skill

## Phase 3 — HTTP / UI adapters (mirror money 2b)

**Subpaths:** `./express`, `./nest`, `./client`, `./react`

- Thin wrappers only — no duplicated validation
- Docs: express, nest, client, react
- Form string conventions in `react/form.ts`

## Phase 4 — Consumer adoption (separate PRs per package)

| Package | Change | Breaking? |
| --- | --- | --- |
| hash-chained-ledger | `occurredAt` documents instant JSON shape | Maybe additive |
| financial-ledger | hydrate helpers like money | Patch/minor |
| valuations | typed `receivedAt` / `expiresAt` | Minor |
| doc-number | optional zoned period helper | Additive only |
| qups | `transaction_date` on line (product decision) | Feature |

Each consumer PR: package docs delta + skill + recipe touch + changeset.

## Phase 5 — Fiscal calendar (separate primitive/capability)

Depends on timestamp core. Roadmap item — not bundled into timestamp v1.

## Test matrix (must-have)

| Scenario | Mode | Assert |
| --- | --- | --- |
| UTC instant parse + normalize | instant | `instant` ends with `Z` |
| Offset input → UTC | instant | normalized |
| Jakarta transaction date from UTC instant | instant | correct local date |
| Paris 9:00 wall → instant (winter vs summer) | wall | different UTC, same local |
| Spring forward gap 2:30 | wall | `TimestampGapError` |
| Fall back overlap 1:30 | wall | `TimestampOverlapError` without disambiguation |
| Invalid zone | both | `InvalidTimeZoneError` |
| Round-trip JSON | both | stable |

## Non-goals (v1)

- Recurrence / cron
- Fiscal year / posting period
- NTP / leap seconds
- Replacing `createdAt` audit timestamps (keep `Date` or instant at DB default)
- Forcing doc-number off UTC

## Promotion

When phase 1+ ship: move public docs from notes into `packages/primitive/timestamp/docs/`, delete `_ai-docs/timestamps/` after promotion per ai-working-docs rule.
