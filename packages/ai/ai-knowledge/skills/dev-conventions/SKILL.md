---
name: dev-conventions
description: >
  Eristack development conventions: GitHub Flow, Changesets for user-facing
  package changes, core vs adapter boundaries, examples-first wiring, package
  docs as source of truth, _ai-docs promote-then-delete. Use when contributing
  to business-libs or aligning an app with Eristack norms.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/dev-conventions.md'
  - 'eristack/business-libs:AGENTS.md'
---

# Development conventions

Full guide: `knowledge/dev-conventions.md`.

## Quick rules

- **GitHub Flow** — feature branch → PR → `main` only
- **Changesets** required for user-facing package changes; not for docs/CI-only
- **Core vs adapters** — no framework imports in core; adapters are separate exports
- **Child resources** — credentials / refresh / formats hang off app-owned entities
- **Docs** — `packages/<name>/docs` is source of truth; don’t duplicate in the web app
- **Scope** — change only what the task needs

## AI working docs (monorepo)

1. While working: `_ai-docs/<topic>/` notes good enough to draft public docs
2. When finished: promote to package docs / site / skills
3. Delete the `_ai-docs/<topic>/` folder after promotion
