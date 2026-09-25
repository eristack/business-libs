---
name: package-relationships
description: >
  Canonical @eristack package dependency map, layer order, ERP vs HTTP vs ledger
  stacks, and which ai-knowledge skill to load first. Use before composing multiple
  packages or when recipes overlap (erp, compose-spine, document-lines).
metadata:
  type: core
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/package-relationships.md'
---

# Package relationships

Load **once**: `knowledge/package-relationships.md`.

## Quick routing

| Ask | First skill |
| --- | --- |
| Document with QUPS lines | `#document-lines-erp` |
| Backseat mock → Drizzle API | `#backseat-then-backend` |
| Which packages to install | This skill, then `loadPlan()` |
| Generic REST shell | `#rest-core` / `#declarative-rest-routes` — not opinion |
| ERP PATCH actions | `#opinion-http` |

## Rules

- **Primitives** do not depend on services. **Core** never imports Express/React/Drizzle.
- **percent** for config rates; **qups + money** for line math — do not duplicate.
- Stock / GL / valuations are **optional modules**, not defaults for job/invoice ERPs.
- Horizon A: use `registerHorizonDocumentSpine` from `@eristack/backseat/seeds` + app hooks for grids/graphs.

Monorepo maintenance: `pnpm debottleneck:check`.
