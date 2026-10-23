# Executive assessment (draft)

**As of:** 2026-10-23 · **Evidence refresh:** partial (inventory + CI verified; per-package tests spot-checked via Aug audit)

## One-line thesis

Eristack is **production-credible at the primitive and document-line layer**, **meta-tooling is ahead of most OSS monorepos**, but **integrators and agents still hit a trust gap**: published adapters and recipes claim Drizzle-first paths that CI does not prove end-to-end.

## Strengths (verified)

| Area | Evidence |
| --- | --- |
| Layered package taxonomy | `packages/{primitive,registries,capability,service,infrastructure,ui,ai}/` — 71 packages (`Glob` package.json count) |
| Unified CI vocabulary | `@eristack/ai-dev` `CHECK_DEFS` — lockfile, build, test, exports, changesets, skills, knowledge, docs, ticket, debottleneck (`.github/workflows/ci.yml` → `pnpm eristack ci`) |
| Agent discoverability | `@eristack/ai-knowledge` — `recommend()`, `loadPlan()`, `recipes.yaml`, generated `catalog.ts` |
| Hard rules for agents | `.cursor/rules/` — ai-knowledge sync, docs depth, no-git, pnpm install policy |
| 3ss platform seams (library) | `@eristack/drizzle`, `@eristack/feedback`, spine tables, adoption skill `#tiga-sekawan-3ss-adoption` |
| Prior audit baseline | `_ai-docs/audit/executive-summary.md` — ranked top 15, letter grades |

## Risks (verified or high-confidence)

| Risk | Severity | Evidence / note |
| --- | --- | --- |
| Drizzle stores untested for ledger/list/valuation | **Critical** | Audit grades HCL/financial/valuations/data-grid **C–D+**; `scripts/run-integration-tests.mjs` exists but coverage uneven |
| `loadPlan()` vs recipe prose mismatch | **Critical** | Audit rank 4; `packages/ai/ai-knowledge/tests/recommend.test.ts` covers API but canonical skill merge may still lag recipes |
| Memory stores on public export surface | **High** | Design rule: memory = tests only; audit rank 7 |
| Instruction sprawl | **High** | AGENTS.md generated block + 9 cursor rules + per-package skills; token budget rule in `docs-depth-tokens.mdc` not fully enforced mechanically |
| Publish hygiene | **High** | `check-publish-deps.mjs`, debottleneck check — audit cited workspace deps (re-verify on current main) |
| Features layer empty | **Medium** | `packages/features/` placeholder; `check-features-layer.mjs` in CI |

## Grades (carry-forward from audit — **re-verify before remediation**)

| Dimension | Grade | Rationale |
| --- | --- | --- |
| Library core quality | **B−** | Strong money/timestamp/qups; weak ledger proof |
| Integrator / agent UX | **C+** | Good routing; plan/skill/doc drift |
| Meta-tooling (ai-dev, ai-knowledge) | **B** | CI profiles strong; ai-dev thin tests |

## Strategic choice (program default)

**Incremental stabilization** — prove production paths, tighten agent SoT, enforce in CI — **not** a rewrite or new meta-framework.

## What this program will not do (unless explicitly tasked)

- Replace TanStack Intent, Changesets, or GitHub Flow
- Move all docs into `_ai-docs/` (WIP only; promote-then-delete)
- Ship `@eristack/feature-*` verticals (layer 07 policy unchanged)
- Implement consumer-app Tiga migration (separate track; link via `#tiga-sekawan-3ss-adoption`)

## Next gate

Human review of [03-findings-register.md](./03-findings-register.md) and approval of **Phase 1** tasks in [tasks.yaml](./tasks.yaml).
