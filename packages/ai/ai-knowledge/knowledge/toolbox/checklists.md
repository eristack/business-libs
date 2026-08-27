# Checklists

## Package design targets (contributors + consumers)

Before shipping or accepting a package change:

- [ ] Agent can integrate in **≤3 files** (skill + one guide ± adapter doc)
- [ ] Getting-started has copy-paste install/import/example/production path
- [ ] Exported registries/helpers replace copy-paste constants in apps (truth modes, validators, field types, codecs)
- [ ] Core behavior matches in forms and on the server (string-first, no float money, no silent `Number()` on decimals)
- [ ] Tests cover real wiring paths; Drizzle/DB is the documented default (memory = tests only)
- [ ] Core vs adapters split clean; app owns UX and domain tables
- [ ] Recipe/skill points to **one** load target, not a doc hunt

## Before implementing a multi-feature ask

- [ ] Loaded `architecture-recommend` if scaffolding or choosing stack/structure
- [ ] Presentation / business / persistence boundaries agreed
- [ ] Ran recommend / loaded `recommend-eristack`
- [ ] Listed prioritized `@eristack/*` packages (or explicitly noted no match)
- [ ] Loaded each required package Intent skill
- [ ] Loaded `stack-defaults` for Eristack adapter details
- [ ] Identified app-owned pieces (users table, UX, FX rate source, migrations)

## Architecture canon (new apps)

- [ ] TypeScript + pnpm monorepo when web/api/shared packages exist
- [ ] Express **or** Nest (not both in one API)
- [ ] Drizzle: Postgres prod, SQLite tests
- [ ] React + Vite + Tailwind + shadcn (`components/ui` via CLI)
- [ ] TanStack Router **file-based** + Query + Form + Intent
- [ ] Zustand for client/UI state only (server state in Query)
- [ ] Typed API contracts between web and api

## Money guardrails

- [ ] No `Money.of(19.99, …)` fractional number construction
- [ ] Same-currency arithmetic only (FX via `Conversion`)
- [ ] Ledger posts rounded
- [ ] Allocations use `allocate` (not naive divide)
- [ ] Serialized amounts are strings

## Auth guardrails

- [ ] App `users` table exists; credentials reference subject
- [ ] Refresh tokens stored hashed
- [ ] Refresh reuse path revokes family / surfaces error
- [ ] Adapter dialect `"pgsql"` for Postgres Drizzle helpers
- [ ] React layer is headless (provider/hooks), not a UI kit

## Doc-number guardrails

- [ ] Format tokens valid (`{YYYY}`, `{SEQ:n}`, …)
- [ ] Mutating allocation via `next`, previews via `peekNext`/`preview`
- [ ] Sequence store used for concurrency-safe increments

## Monorepo change touching another package

- [ ] Updated that package’s skills/docs if public guidance changed
- [ ] Ran `pnpm knowledge:sync`
- [ ] Added/updated recipes if users should discover the capability by product language
- [ ] `pnpm knowledge:check` clean
- [ ] Changeset added for user-facing package changes
- [ ] **One changeset file per package**; body lists only that package (no mega shared changelog)
- [ ] **`patch`** on `0.1.x` packages (not `minor` unless intentional 1.0.0)
- [ ] `pnpm changesets:check` clean

## Upgrading @eristack (consumer app)

- [ ] Loaded `upgrading-eristack` skill (or read `knowledge/upgrading.md`)
- [ ] Checked `pnpm outdated '@eristack/*'` and `/{slug}/changelog` for each dependency
- [ ] Bumped semver ranges; did not use `workspace:*` on published peers
- [ ] Optional Backseat: peer `"@eristack/backseat": "^0.1.0"` if importing `@eristack/*/backseat`
- [ ] Loaded per-package Intent skills for anything whose wiring changed
- [ ] Typecheck / tests green

## Skill load order (typical ERP slice)

1. `@eristack/ai-knowledge#recommend-eristack`
2. `@eristack/ai-knowledge#stack-defaults`
3. `@eristack/jwt-auth#jwt-auth-core` → `#jwt-auth-adapters` if wiring HTTP/DB
4. `@eristack/money#money-amounts` → `#money-ledger` if invoices/splits/FX
5. `@eristack/doc-number#doc-number-core` → `#doc-number-adapters` if persisting formats
