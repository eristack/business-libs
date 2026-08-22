---
name: agent-workflow
description: >
  Agent workflow for @eristack: four design targets (cheap tokens, predictable,
  reliable, clear boundaries — consumers must not reinvent exports), recommend
  first, load skills before coding, prefer examples, HARD RULE docs+skills+
  recipes + pnpm knowledge:sync every iteration. Use for multi-package work or
  monorepo contributions.
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

## Design targets (do not miss)

Every `@eristack/*` package iteration must satisfy:

1. **Cheap (tokens)** — agent wires in **≤3 files**; one canonical doc; export registries/helpers (`QUPS_TRUTH_MODES`, amount-only validators, decimal field types) — no copy-paste parallel lists in apps.
2. **Predictable** — same core API in React + server; string-first values; explicit defaults; no silent `Number()` on money/decimals.
3. **Reliable** — real-path tests; Drizzle/DB default in skills; memory stores tests-only; `pnpm exports:check` when exports change.
4. **Clear boundaries** — recommend first; core vs adapters; app owns UX/domain tables; if consumers would duplicate logic, **export it from the library**.

Before closing: can an agent integrate in ≤3 files without reinventing domain glue?

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
