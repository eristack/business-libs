---
name: ai-toolbox
description: >
  Practical AI agent toolbox for Eristack: feature-brief prompts, skill-load
  order, money/auth/doc-number guardrail checklists, and recipe-authoring
  template for keeping @eristack/ai-knowledge discoverable. Use when briefing
  agents, reviewing plans, or adding recipes after new package capabilities.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.1'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/toolbox/prompts.md'
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/toolbox/checklists.md'
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/ai-toolbox-decision-tree.md'
---

# AI toolbox

Use the installed markdown tools:

- `knowledge/toolbox/prompts.md` — copy/paste agent briefs
- `knowledge/toolbox/checklists.md` — preflight, **package design targets**, guardrails
- `knowledge/ai-toolbox-decision-tree.md` — ai-dev vs ai-knowledge vs ai-workflow vs ai-ticket-generator

## Feature brief (short)

```text
Build: <A>, <B>, <C>.
1) Load recommend-eristack / call recommend()
2) Prefer @eristack matches first
3) Load each package skill before coding
4) Follow stack-defaults for scaffolding
```

## Typical skill load order

1. `ai-knowledge#architecture-recommend` (new apps / structure)
2. `ai-knowledge#upgrading-eristack` (bump deps / changelogs / Backseat peers)
3. `ai-knowledge#recommend-eristack`
4. `ai-knowledge#stack-defaults` (Eristack wiring)
5. Package cores (`jwt-auth-core`, `money-amounts`, `doc-number-core`)
6. Package adapters only when wiring DB/HTTP/UI shells

## Guardrails (minimum)

- Money: strings/minor units; round at boundaries; allocate don’t naive-divide
- Auth: child credentials; hashed refresh; `"pgsql"` dialect
- Doc numbers: `next` allocates; previews don’t mutate

## After adding a discoverable capability

1. Edit `knowledge/recipes.yaml` with spoken triggers
2. Reference real catalog package/skill ids only
3. `pnpm knowledge:sync` && `pnpm knowledge:check`
