# Inventory — workstream A (draft)

## A1 — Publishable packages (71)

Discovery: `packages/**/package.json` (excluding examples).

| Layer | Count | Path prefix |
| --- | ---: | --- |
| Primitive | 16 | `packages/primitive/` |
| Registries | 3 | `packages/registries/` (+ `id-wilayah`) |
| Capability | 8 | `packages/capability/` |
| Service | 22 | `packages/service/` |
| Infrastructure | 6 | `packages/infrastructure/` (+ `drizzle`, `drizzle-kit-helpers`) |
| UI | 11 | `packages/ui/` (+ `feedback` under ui) |
| AI | 4 | `packages/ai/` |
| Features | 0 | `packages/features/` (placeholder) |

**Not counted:** `examples/*`, `internal/test-harness`, `apps/web`, root tooling.

## A2 — CI and check scripts

| Check ID | Script / command | Profiles (default) |
| --- | --- | --- |
| lockfile | `scripts/lockfile-check.mjs` | catalog, pr, full |
| build / typecheck / test / lint | turbo via `eristack check` | pr, full, fast |
| integration | `scripts/run-integration-tests.mjs` | pr, full, integration |
| examples | example apps build | pr, full, examples |
| exports | `scripts/check-package-exports.mjs` | catalog, pr, full |
| changesets | `scripts/check-changesets.mjs` | catalog, pr, full |
| publish | `scripts/check-publish-deps.mjs` (+ @eristack peer floors) | pr, full, publish |
| debottleneck | `scripts/package-debottleneck-check.mjs` | catalog, pr, full |
| skills | `scripts/skills-validate.mjs` | catalog, pr, full |
| agents-intent-sync | `scripts/check-agents-intent-sync.mjs` | catalog, pr, full |
| skill-sources | `scripts/check-skill-sources.mjs` | catalog, pr, full |
| memory-exports | `scripts/check-memory-root-exports.mjs` | catalog, pr, full |
| knowledge | `packages/ai/ai-knowledge/scripts/*` + mirror check | catalog, pr, full |
| docs | `scripts/docs-check.mjs` | catalog, pr, full |
| ticket | `scripts/ticket-triage.mjs` | catalog, pr, full |
| contrast | `apps/web/scripts/check-brand-contrast.mjs` | catalog, pr, full |
| features | `scripts/check-features-layer.mjs` | catalog, pr, full |

**Entry commands:**

```bash
pnpm eristack plan --json
pnpm eristack ci --base origin/main          # PR-style affected
pnpm eristack check --profile pr             # main push (full pr profile)
pnpm prepush                                 # local affected gate
```

Source: `packages/ai/ai-dev/src/checks/registry.ts`, `.github/workflows/ci.yml`.

## A3 — Documentation surfaces

| Surface | SoT path | Sync / gate |
| --- | --- | --- |
| Package guides | `packages/<cat>/<name>/docs/` | `pnpm docs:sync` → `apps/web` nav |
| Cross-cutting canon | `packages/ai/ai-knowledge/knowledge/*.md` | Mirror to `packages/ai/ai-knowledge/docs/` |
| Agent skills | `packages/*/skills/**/SKILL.md` | `pnpm knowledge:sync`, `intent validate` |
| Recipes | `packages/ai/ai-knowledge/knowledge/recipes.yaml` | `recommend()` / `loadPlan()` |
| Human agent index | `AGENTS.md` (generated intent block) | `pnpm exec intent install --map` |
| Cursor rules | `.cursor/rules/*.mdc` | Manual; target for enforcement design |
| WIP / audit | `_ai-docs/wip/`, `_ai-docs/audit/` | Promote-then-delete policy |
| Product roadmap | `roadmap/` | Site `/roadmap` |
| Maintainer tickets | `tickets/`, `tickets/triage.yaml` | `ticket` check |

## A4 — Agent workflow artifacts

| Artifact | Role |
| --- | --- |
| `@eristack/ai-knowledge#recommend-eristack` | Route product language → packages |
| `@eristack/ai-knowledge#agent-workflow` | Design targets, iteration checklist |
| `@eristack/ai-dev` | plan / check / sync / MCP |
| `@eristack/ai-workflow` | Consumer-project memory (optional) |
| `@eristack/ai-ticket-generator` | Portable bug/suggestion tickets |

## A5 — Examples

| App | Path | Purpose |
| --- | --- | --- |
| Express + Drizzle SQLite | `examples/express` | jwt-auth, data-grid, idempotency |
| Nest | `examples/nestjs` | Module/guard patterns |
| React client | `examples/react` | Headless clients |
| Horizon A | `examples/horizon-a` | Backseat document spine |

CI: `examples` check in pr profile (audit rank 12 — confirm green on main).

## A6 — Discovery artifacts (Phase 0)

| Artifact | Path |
| --- | --- |
| Drizzle integration matrix | [data/drizzle-integration.md](./data/drizzle-integration.md) |
| Memory root exports | [data/memory-root-exports.md](./data/memory-root-exports.md) |
| Verification log | [data/phase0-verification-log.md](./data/phase0-verification-log.md) |
| Skill source allowlist | [data/skill-sources-allowlist.md](./data/skill-sources-allowlist.md) |

## A7 — Stabilization scripts (program)

| Script | Purpose |
| --- | --- |
| `scripts/check-skill-sources.mjs` | ai-knowledge cross-cutting skills ≤1 source (STAB-AI-1) |
| `scripts/check-memory-root-exports.mjs` | no new `createMemory*` on package root (STAB-MEM-1) |
