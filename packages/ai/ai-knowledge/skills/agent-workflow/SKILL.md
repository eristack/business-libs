---
name: agent-workflow
description: >
  How AI agents should use @eristack/ai-knowledge and package Intent skills:
  recommend first, load skills before coding, prefer examples for adapters,
  HARD RULE update docs+skills+recipes and pnpm knowledge:sync every package
  iteration. Use when starting multi-package work or contributing inside the
  business-libs monorepo.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.1'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/agent-workflow.md'
  - 'eristack/business-libs:packages/ai/ai-knowledge/docs/sync.md'
---

# Agent workflow

Full guide: `knowledge/agent-workflow.md`.

## Order of operations

1. **Architecture** — `architecture-recommend` when scaffolding or choosing stack/structure
2. **Recommend** — `recommend-eristack` or `recommend()` / `loadPlan()`
3. **Load package skills** — before editing money / jwt-auth / doc-number / adapters
4. **Follow examples** — `examples/express`, `examples/nestjs`, `examples/react`
5. **Implement** — app owns domain tables, UX, FX feeds, migrations

## Upgrading consumer apps

When bumping `@eristack/*`: load `upgrading-eristack`, read **`knowledge/upgrading.md` only** (canonical). Do not open eleven `docs/backseat.md` files. One package skill only if production wiring changed.

## HARD RULE — docs + ai-knowledge every iteration

Same change set must include:

1. Package `docs/`
2. Package Intent `skills/`
3. `recipes.yaml` when product-discoverable
4. `pnpm knowledge:sync` + `pnpm knowledge:check`

Do not ship fresh docs with a stale catalog.

## Docs while implementing

- WIP → `_ai-docs/<topic>/` (note skill/recipe impact)
- Finished → promote to `packages/<category>/*/docs`, sync ai-knowledge, delete the topic folder
- Package docs are source of truth; the website renders them

## Version control

Humans own git/commits/PRs in Eristack agent taboo environments. Do not create commits or PRs unless explicitly operating under different human rules.
