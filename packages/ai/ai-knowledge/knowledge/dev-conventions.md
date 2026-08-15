# Development conventions

Conventions for apps consuming Eristack and for contributors to the business-libs monorepo.

## Product priorities

1. **Correct money and identity** beat clever abstractions.
2. **Small, sharp packages** with clear boundaries (core vs adapters).
3. **Headless shells** — Express/Nest/React adapters stay thin; the app owns UX and domain tables.
4. **Agent-readable docs and skills** ship with packages (`docs/`, `skills/`).

## Monorepo layout (business-libs)

| Path | Role |
| --- | --- |
| `packages/primitive/money` | `@eristack/money` (primitive) |
| `packages/capability/doc-number` | `@eristack/doc-number` (capability) |
| `packages/service/jwt-auth` | `@eristack/jwt-auth` (service) |
| `packages/infrastructure/backseat` | `@eristack/backseat` (infrastructure; browser mock REST + IndexedDB) |
| `packages/ui/multitab` | `@eristack/multitab` (UI; tab workspace — coming soon) |
| `packages/features/` | ERP feature modules (coming soon) |
| `packages/ai/ai-knowledge` | `@eristack/ai-knowledge` (AI; this pack) |
| `packages/ai/ai-workflow` | `@eristack/ai-workflow` (AI) |
| `roadmap/` | Living priority stack for future packages |
| `examples/*` | Private runnable demos (not published) |
| `apps/web` | Public site; renders `packages/<category>/*/docs` by category |
| `_ai-docs/` | Temporary AI working notes |
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
| **`minor`** | **`0.1.0`** (first publish) | **`1.0.0`** (intentional exit from 0.x) |

Routine features/fixes on packages already past `0.0.0`: use **`patch`**. Use **`minor`** on `0.0.0` for first release, or when you **mean 1.0.0**.

### Internal optional peers (Backseat spine)

- Published **`peerDependencies`**: semver (`^0.1.0`), not `workspace:*`
- Monorepo **`devDependencies`**: `workspace:*`
- `.changeset/config.json`: `onlyUpdatePeerDependentsWhenOutOfRange: true` — dependents bump only when the new peer is outside the declared range
- No **`fixed`** / **`linked`** Changesets groups

Consumer upgrade steps: [`upgrading.md`](./upgrading.md) · skill `@eristack/ai-knowledge#upgrading-eristack`.

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

## Scope discipline

- Change only what the task requires
- Do not rewrite root README for agent guidance (use `AGENTS.md` / skills)
- Never commit secrets or tokens into docs or AI notes
