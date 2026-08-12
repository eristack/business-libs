---
name: ai-workflow-core
description: >
  Local-first @eristack/ai-workflow: .eristack/workflow backlog/sprints/ADR/summary,
  FTS+vector index, low-token search discipline. Use when scaffolding AI-native
  project memory or sprint cadence without replacing Intent, git, or editors.
metadata:
  type: core
  library: '@eristack/ai-workflow'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-workflow/docs/workflow.md'
  - 'eristack/business-libs:packages/ai/ai-workflow/docs/search.md'
---

# AI workflow core

## Layout

`.eristack/workflow/` — backlog, sprints (`plan.md`, `tasks.yaml`, `adr/`, `summary.md`)  
`.eristack/index/` — local SQLite (gitignored)

## Token rules

1. Prefer `search` over grepping the whole repo blindly.
2. Search returns ≤8 hits / ≤3-line snippets — then `read_chunk` for one path.
3. Workflow tools return ids/status/paths; open markdown for narrative.
4. Do not invent dump-everything tools.

## Commands

```bash
pnpm eristack-workflow init
pnpm eristack-workflow index
pnpm eristack-workflow sprint create --title "…"
```

Stack/package routing still belongs to `@eristack/ai-knowledge`.
