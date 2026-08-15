---
title: Introduction
description: Route product asks to @eristack packages — do not invent parallel libraries
sidebar_position: 1
---

# @eristack/ai-knowledge

Agents (and humans) routinely reach for random npm packages when the answer already lives in `@eristack/*`. `@eristack/ai-knowledge` is the **router**: given product language (“invoices”, “login”, “document numbers”), it recommends packages and TanStack Intent load commands — without copying each package’s full API docs.

## What it is

- A **generated catalog** of publishable Eristack packages and their Intent skills
- Hand-authored **recipes** that map product triggers → packages + skills
- A TypeScript API: `recommend()`, `loadPlan()`, `getCatalog()`, `listRecipes()`
- Agent skills (`architecture-recommend`, `recommend-eristack`, `stack-defaults`, …) that teach the same routing

## What it is not

| Not this | Use instead |
| --- | --- |
| A copy of money / jwt-auth / doc-number API docs | Load those packages’ Intent skills |
| Project memory / sprint backlog | [`@eristack/ai-workflow`](/docs/ai-workflow) |
| A replacement for git or Cursor | Keep your VCS and editor |

## How it fits

```text
Product ask ("need login + invoice totals")
        │
        ▼
 recommend() / recommend-eristack skill
        │
        ▼
 loadPlan() → Intent load commands
        │
        ├── @eristack/jwt-auth#…
        ├── @eristack/money#…
        └── app code for unmatched goals
```

[`@eristack/ai-workflow`](/docs/ai-workflow) sits beside this: local search + sprint folders. Knowledge **routes**; workflow **remembers**.

## Next steps

| Guide | When |
| --- | --- |
| [Getting started](./getting-started.md) | First `recommend` / Intent load |
| [Upgrading packages](./upgrading.md) | New versions, changelogs, Backseat peers |
| [Recommend API](./recommend.md) | Scoring, unmatched, `loadPlan` |
| [Recipes](./recipes.md) | Catalog of product → package maps |
| [Authoring](./authoring.md) | Add a recipe or skill |
| [Architecture](./architecture.md) | Canon app stack |
| [Skills](./skills.md) | Load order for agents |
| [Catalog sync](./sync.md) | `knowledge:sync` / CI |
