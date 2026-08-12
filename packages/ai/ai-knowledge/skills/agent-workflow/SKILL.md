---
name: agent-workflow
description: >
  How AI agents should use @eristack/ai-knowledge and package Intent skills:
  recommend first, load skills before coding, prefer examples for adapters,
  keep the generated catalog in sync when package skills change. Use when
  starting multi-package work or contributing inside the business-libs monorepo.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.0'
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

## Monorepo freshness (authors)

When changing another package’s skills, public exports, or discoverable capabilities:

```bash
pnpm knowledge:sync
```

Add/update `packages/ai/ai-knowledge/knowledge/recipes.yaml` when users should discover the capability by product language. CI enforces `pnpm knowledge:check`.

## Docs while implementing

- WIP → `_ai-docs/<topic>/`
- Finished → promote to `packages/<category>/*/docs`, delete the topic folder
- Package docs are source of truth; the website renders them

## Version control

Humans own git/commits/PRs in Eristack agent taboo environments. Do not create commits or PRs unless explicitly operating under different human rules.
