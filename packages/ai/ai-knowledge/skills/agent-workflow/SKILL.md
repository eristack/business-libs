---
name: agent-workflow
description: >
  Agent workflow for @eristack: four design targets (cheap tokens, predictable,
  reliable, clear boundaries — consumers must not reinvent exports), recommend
  first, install and load skills before coding, prefer examples. Contributor
  section: HARD RULE docs+skills+recipes + pnpm knowledge:sync every iteration.
  Use for multi-package app work or monorepo contributions.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.1'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/agent-workflow.md'
---

# Agent workflow

Full guide: `knowledge/agent-workflow.md`.

## Order of operations (apps using Eristack)

1. **Architecture** — `architecture-recommend` when scaffolding or choosing stack/structure
2. **Recommend** — `recommend-eristack` or `recommend()` / `loadPlan()`
3. **Install** — `pnpm add @eristack/<name>` for every matched package; do not re-implement what it exports
4. **Load package skills** — before editing money / jwt-auth / doc-number / adapters
5. **Follow examples** — [`examples/express`, `examples/nestjs`, `examples/react`](https://github.com/eristack/business-libs/tree/main/examples)
6. **Implement** — app owns domain tables, UX, FX feeds, migrations

## Design targets (what every package promises)

1. **Cheap (tokens)** — agent wires in **≤3 files**; one canonical doc; registries/helpers are exported (`QUPS_TRUTH_MODES`, amount-only validators, decimal field types) — import them, never keep parallel lists in apps.
2. **Predictable** — same core API in React + server; string-first values; explicit defaults; no silent `Number()` on money/decimals.
3. **Reliable** — real-path tests; Drizzle/DB default; memory stores tests-only.
4. **Clear boundaries** — recommend first; core vs adapters; app owns UX/domain tables; if the app would duplicate logic, that is a package gap to report (`@eristack/ai-ticket-generator#ai-ticket-suggest`), not code to copy.

## Upgrading consumer apps

When bumping `@eristack/*`: load `upgrading-eristack`, read **`knowledge/upgrading.md` only** (canonical). Do not open eleven `docs/backseat.md` files. One package skill only if production wiring changed.

## Contributors to eristack/business-libs only

Skip this section when building an app.

- **HARD RULE — docs + ai-knowledge every iteration:** same change set updates package `docs/`, Intent `skills/`, `recipes.yaml` when product-discoverable, then `pnpm knowledge:sync` + `pnpm knowledge:check`. `pnpm exports:check` when exports change.
- **Docs while implementing:** WIP → `_ai-docs/wip/<topic>/`; finished → promote to `packages/<category>/*/docs`, sync ai-knowledge, delete the WIP folder. Package docs are source of truth; the website renders them.
- **Version control:** humans own push/PRs; agents follow the repo's commit rules.
