---
title: Skills
description: Intent skills shipped by ai-knowledge and recommended load order
sidebar_position: 7
---

# Skills

Load with:

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#<skill-id>

These skills ship inside the `@eristack/ai-knowledge` npm package. Editing a skill does **not** need its own release — bump and publish this package once (Changesets).
```

## Inventory

| Id | Purpose |
| --- | --- |
| `architecture-recommend` | Canon app architecture (layers, stack, TanStack) |
| `recommend-eristack` | Route product asks to `@eristack/*` via recipes + catalog |
| `stack-defaults` | Eristack wiring defaults (Drizzle `pgsql`, credentials child of users, …) |
| `agent-workflow` | recommend → load skills → prefer examples → knowledge:sync |
| `dev-conventions` | GitHub Flow, Changesets, docs source of truth, `_ai-docs` |
| `ai-toolbox` | Feature-brief prompts, checklists, recipe authoring template |

## Load order

1. **Architecture** — when scaffolding or choosing structure  
2. **Recommend** — when the user states a product feature  
3. **Package skills** — money / jwt-auth / doc-number / data-grid core then adapters  
4. **Stack defaults** — while generating app code  
5. **Dev conventions / toolbox** — as needed for contribution or briefs  

## What these skills do *not* cover

| Skill | Does not replace |
| --- | --- |
| `recommend-eristack` | Full package API docs — load package skills next |
| `architecture-recommend` | Your product’s exception list — call exceptions out |
| `agent-workflow` | `@eristack/ai-workflow` MCP/search — different package |

## Catalog block

`recommend-eristack` contains a generated `<!-- catalog:* -->` section. Regenerate with `pnpm knowledge:sync`. Do not hand-edit.
