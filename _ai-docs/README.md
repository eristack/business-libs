# AI working docs

Temporary notes written **while** a feature is in progress. Not public documentation.

## Workflow

1. **Start work** → create `_ai-docs/<topic>/` and write notes that could later become package/web docs.
2. **Ship the feature** → when the user says the work is finished, promote notes into:
   - `packages/<category>/<name>/docs/` (source of truth for library guides)
   - `apps/web/` (marketing / company pages; package docs are rendered from `packages/<category>/*/docs`)
   - skills under `packages/<category>/<name>/skills/` when agent guidance changes
3. **Clean up** → delete `_ai-docs/<topic>/`.

## Suggested layout

```text
_ai-docs/
  <topic>/
    overview.md      # why, scope, status
    decisions.md     # ADRs / trade-offs
    api.md           # public surface, examples
    migration.md     # breaking changes / upgrade notes (if any)
```

WIP task folders are gitignored; this README is tracked.

Agents must never run git/commit/PR operations — humans own version control.
