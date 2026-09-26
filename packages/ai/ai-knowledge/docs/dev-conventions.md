# Development conventions

Conventions for apps consuming Eristack and for contributors to the business-libs monorepo.

## Product priorities

Four **design targets** govern every package (details: [`agent-workflow.md`](./agent-workflow.md) § Design targets; Cursor: `.cursor/rules/eristack-package-targets.mdc`):

1. **Cheap to implement (tokens)** — integration in ≤3 files; canonical docs; export registries/helpers consumers would copy.
2. **Predictable result** — same behavior in core, forms, and API; string-first domain values; documented defaults.
3. **High reliability** — production paths tested; Drizzle/DB default; no demo-only stores in skills.
4. **Clear boundaries** — sharp packages; recommend before inventing; app owns UX and domain tables; **consumers must not reinvent** library exports.

Supporting norms:

- **Package graph:** load `@eristack/ai-knowledge#package-relationships` before multi-package wiring; run `pnpm debottleneck:check:ci` in CI (`eristack check --profile pr`).
- **Correct money and identity** beat clever abstractions.
- **Headless shells** — Express/Nest/React adapters stay thin.
- **Agent-readable docs and skills** ship with every package (`docs/`, `skills/`).

## Monorepo layout (business-libs)

| Path | Role |
| --- | --- |
| `packages/primitive/money` | `@eristack/money` (primitive) |
| `packages/capability/doc-number` | `@eristack/doc-number` (capability) |
| `packages/service/jwt-auth` | `@eristack/jwt-auth` (service) |
| `packages/infrastructure/backseat` | `@eristack/backseat` (infrastructure; browser mock REST + IndexedDB) |
| `packages/ui/multitab` | `@eristack/multitab` (UI; tab workspace — coming soon) |
| `packages/features/` | **Under construction** — future `@eristack/feature-*`; see `roadmap/features.md` |
| `packages/ai/ai-knowledge` | `@eristack/ai-knowledge` (AI; this pack) |
| `packages/ai/ai-workflow` | `@eristack/ai-workflow` (AI) |
| `roadmap/` | Living priority stack for future packages |
| `examples/*` | Private runnable demos (not published) |
| `apps/web` | Public site; renders `packages/<category>/*/docs` by category |
| `_ai-docs/` | WIP (`wip/`), brainstorm, audit — see `_ai-docs/README.md` |
| `_artifacts/` | Domain maps / skill specs |
| `.changeset/` | Pending release notes |

Category order (docs + filesystem): primitive → capability → service → infrastructure → ui → features → AI.

## Branching and releases

- **GitHub Flow** — feature branches from `main`, PRs into `main` only
- Do not revive a long-lived `dev` integration branch
- User-facing package changes need `pnpm changeset`
- Docs-only / CI-only changes do not need a changeset

### Changesets on `0.x` (contributors)

| Changeset type | On `0.0.0` | On `0.1.0+` (still pre-1.0) |
| --- | --- | --- |
| **`patch`** | `0.0.1` | next **`0.(n+1).0`** (stay pre-1.0) |
| **`minor`** | **`0.1.0`** (first publish) | **`0.2.0`** semver on 0.1.x — **breaks `^0.1.0` peers** (`<0.2.0`) and Changesets **major-bumps** all peer dependents (e.g. backseat → 12 spine packages). Use only when coordinating a release train. |

Routine features/fixes on packages already past `0.0.0`: use **`patch`** (e.g. `0.1.4` → `0.1.5`, stays inside `^0.1.0`). Use **`minor`** on `0.0.0` for first release, or when you **mean** a 0.y line bump / exit from 0.x with peer range updates.

**Peer cascade (why patch on `@eristack/backseat`):** twelve packages declare optional peer `"@eristack/backseat": "^0.1.0"`. npm treats `^0.1.0` as `>=0.1.0 <0.2.0`. A **minor** changeset on backseat at `0.1.4` becomes **`0.2.0`**, out of range — Changesets (`onlyUpdatePeerDependentsWhenOutOfRange: true`) schedules **major** bumps on jwt-auth, qups, pbac, etc. This is not `workspace:*` in `dependencies` (those are clean); it is **peer semver range** + Changesets policy.

### Changeset file shape (CI enforced)

- **One `@eristack/*` package per `.changeset/*.md` file** — a multi-package frontmatter block repeats the same body in every package changelog on the Version PR.
- **Body describes only that package** — no `### @eristack/foo` cross-package sections or copy-pasted monolith.
- Run **`pnpm changesets:check`** in CI and locally before merge.

### Internal optional peers (Backseat spine)

- Published **`peerDependencies`**: semver (`^0.1.0`), not `workspace:*`
- Monorepo **`devDependencies`**: `workspace:*`
- `.changeset/config.json`: `onlyUpdatePeerDependentsWhenOutOfRange: true` — dependents bump only when the new peer is outside the declared range
- No **`fixed`** / **`linked`** Changesets groups

Consumer upgrade steps: [`upgrading.md`](./upgrading.md) · skill `@eristack/ai-knowledge#upgrading-eristack`.

### Two-PR release model (contributors)

Ship features in **one feature PR**; let Changesets + CI own version bumps in a **second PR**. Do not run `pnpm changeset version` locally on a feature branch.

| Ship in the **feature PR** | Do **not** touch in the feature PR | CI / Version Packages PR |
| --- | --- | --- |
| Source, tests, `package.json` **exports** (not `version`) | `package.json` `version` fields | `changeset version` bumps versions |
| Package `docs/` + Intent `skills/` **content** | Hand-edited `CHANGELOG.md` | Generated changelog sections |
| `recipes.yaml`, `pnpm knowledge:sync` output (`catalog.ts`, `recipes.ts`, `recommend-eristack` catalog block) | Deleting skill/recipe work when reverting a mistaken local version | `pnpm knowledge:sync` again (via `version-packages`) so catalog versions match bumped `package.json` |
| One or more `.changeset/*.md` files | Running `changeset publish` locally | `pnpm release` on npm after Version PR merges |

**If you accidentally ran `changeset version` locally:** revert only `version` + `CHANGELOG` + lockfile drift. Keep skills, recipes, generated catalog content, and docs — those are the feature.

**Feature PR green bar:** `pnpm ci` (=`pnpm build && pnpm eristack check --profile full --skip-build`). Agents: run `pnpm eristack plan --json` first for a minimal command list.

**After feature PR merges to `main`:** the Release workflow opens **“chore: version packages”**. Review and merge it; npm publish runs on that merge.

### Publish gate — package exports (hard rule)

1. Every subpath imported by spine packages must appear in **`package.json` `exports`** (e.g. `"./adapters"` on `@eristack/backseat`).
2. Every export subpath must have a **`tsup` entry** that builds `dist/…`.
3. After **`pnpm build`**, run **`pnpm exports:check`** — CI enforces; catches Vite `Missing "./adapters" specifier`.
4. Add **`import("@eristack/pkg/subpath")`** tests for new public subpaths.

Do not document/catalog an export unless it passes `exports:check`.

## Adapter design rules

- Core entry is framework-agnostic (no Express/Nest/React/Drizzle imports in core)
- Adapters are separate export paths (`/drizzle`, `/express`, `/nest`, `/client`, `/react`, …)
- App injects `db`, secrets, and domain ids — libraries do not own your users table
- Credentials / refresh tokens / format sequences are **child** resources

## Testing

- Prefer focused unit tests next to behavior (`tests/` or `src/**/*.test.ts`)
- Memory stores are for tests/ephemeral use; Drizzle stores for production paths
- Examples prove end-to-end wiring; they are not published packages

## Documentation + ai-knowledge (hard rule)

- Library guides: `packages/<category>/<name>/docs/*.md` + `_meta.json`
- Do not duplicate library markdown inside `apps/web`
- Site-only marketing/story/support pages live under `apps/web`
- **Every iteration:** update `docs/` + Intent `skills/` together; update `packages/ai/ai-knowledge/knowledge/recipes.yaml` when discoverable by product language; run `pnpm knowledge:sync` / `knowledge:check`
- Stale ai-knowledge after a docs/API change is incomplete work

### Token-efficient documentation (hard rule)

Agents are the primary audience. **In-depth** does not mean **many files**.

| Cross-cutting topic | One canonical doc |
| --- | --- |
| Upgrades, Backseat spine, peers, Changesets | `packages/ai/ai-knowledge/knowledge/upgrading.md` + `@eristack/ai-knowledge#upgrading-eristack` |
| Product routing | `recipes.yaml` + `recommend-eristack` skill |

Per-package docs: full detail for **that package’s production adapters**; for monorepo-wide Backseat wiring, **redirect** to upgrading §3 with a small delta table only. See `.cursor/rules/docs-depth-tokens.mdc`.

## AI working docs (`_ai-docs/`)

Three buckets — see repo `_ai-docs/README.md`:

| Bucket | Path | Rule |
| --- | --- | --- |
| WIP | `_ai-docs/wip/<topic>/` | Ephemeral; delete after promote |
| Brainstorm | `_ai-docs/brainstorm/` | Package names before `roadmap/horizon.md` |
| Audit | `_ai-docs/audit/` | Point-in-time quality snapshot |

While implementing: WIP notes good enough to draft public docs (include skill/recipe impact). When finished: promote to package docs / site / skills / recipes; sync catalog; **delete** the WIP folder.

## Drizzle integration tests (Sprint A)

Production paths default to Drizzle; prove them with sqlite integration tests — not memory stores in skills.

| Piece | Location |
| --- | --- |
| Shared sqlite helper | `@internal/test-harness` — `createTestSqliteDb`, `execSql`, `canUseBetterSqlite` |
| Hash-chain harness | `@eristack/hash-chained-ledger/testing` — `setupHclSqlite`, tamper helpers |
| Per-package test | `packages/<layer>/<name>/tests/drizzle.integration.test.ts` |
| Run all | `pnpm test:integration` (root) or `pnpm eristack check --profile integration` |

**Pattern:** wrap suites in `describe.skipIf(!canUseBetterSqlite())` so CI without native bindings skips cleanly. When adding a new Drizzle store, add or extend an integration test in the same PR.

## Shipping a new `@eristack/*` package (HARD RULE — do not skip steps)

When adding a **new publishable package** under `packages/<category>/<name>/`, complete this checklist in the **same change set** as the code. Agents must not merge library code without site + knowledge visibility.

### 1. Package spine

| Step | Location |
| --- | --- |
| Core + adapters + tests | `packages/.../src`, `tests/` — Drizzle integration where applicable; memory only in unit tests |
| Public exports | `package.json` `exports` + `tsup` entries → `pnpm build` + `pnpm exports:check` |
| Package docs (source of truth) | `docs/` — getting-started with ≤3-file wiring, `_meta.json` sections |
| Intent skills | `skills/**/SKILL.md` — actionable body; `sources` → **one** canonical guide when possible |
| Ticket stub | `ticket.yaml` if repo convention requires it |

### 2. Agent discoverability (`@eristack/ai-knowledge`)

| Step | Location |
| --- | --- |
| Recipe | `packages/ai/ai-knowledge/knowledge/recipes.yaml` — product language (`recommend()` must find it) |
| Dependency map | `knowledge/package-relationships.md` — stack row + load order |
| Upgrade matrix | `knowledge/upgrading.md` — new package row, IndexedDB/Backseat notes if any |
| Sync | `pnpm knowledge:sync` then `pnpm knowledge:check` |

### 3. Public site (`apps/web`) — **required**

| Step | Location |
| --- | --- |
| Product card | `apps/web/src/lib/site.ts` — slug, npm name, layer, description, doc path |
| Products page | `apps/web/src/app/products/page.tsx` — metadata/copy if the grid intro should mention the capability |
| Home / ecosystem | `apps/web/src/lib/ecosystem-content.ts` — new tech (e.g. AWS S3, presigned uploads) in the right layer group |
| Site config | `apps/web/src/lib/site-config.ts` — tagline/description when it changes what Eristack “is” |
| Marketing strengths | `apps/web/src/lib/marketing-content.ts` — optional bullet if it is a headline capability |
| Docs nav on site | `pnpm docs:sync` after `docs/_meta.json` changes — human commits generated `_meta.json` under `apps/web` |

### 4. Release

| Step | When |
| --- | --- |
| Changeset | User-facing API/behavior → `pnpm changeset` |
| CI | `pnpm eristack check --profile pr` or `pnpm ci:pr` before merge |

### 5. Cursor / repo memory

- `.cursor/rules/new-package-ship.mdc` — quick agent reminder (points here).
- Cross-cutting ERP patterns (e.g. document attachments): **one** delta in the canonical guide (`document-lines-erp.md`), not ten package stubs.

**Definition of done:** package builds, tests pass, docs + skills + recipe + site catalog + ecosystem copy updated, `knowledge:check` and `docs:check` green.

## Scope discipline

- Change only what the task requires
- Do not rewrite root README for agent guidance (use `AGENTS.md` / skills)
- Never commit secrets or tokens into docs or AI notes
