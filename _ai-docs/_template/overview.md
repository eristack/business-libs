---
status: draft
topic: <topic-slug>
promotes-to:
  - packages/<category>/<name>/docs/<page>.md
skills:
  - "@eristack/<package>#<skill-id>"
recipes:
  - <recipe-id>
---

# <Topic> — overview

## Problem

What we're solving and why it matters.

## Scope

In / out for this change.

## Public surface (draft)

APIs, tables, routes, or pages that will need real docs.

## Examples

```ts
// Snippet good enough to land in packages/<category>/*/docs later
```

## Open questions

- …

## Promotion checklist

- [ ] Package docs updated (source of truth)
- [ ] Intent skills updated
- [ ] `recipes.yaml` + `pnpm knowledge:sync` + `pnpm knowledge:check`
- [ ] User confirmed finished → delete `wip/<topic>/`
