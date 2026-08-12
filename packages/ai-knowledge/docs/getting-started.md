---
title: Getting started
description: Install and use @eristack/ai-knowledge from an app or agent
sidebar_position: 2
---

# Getting started

## Install

```bash
pnpm add @eristack/ai-knowledge
```

For Intent skills in a consumer repo:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
```

## Recommend packages for a feature brief

```ts
import { recommend, loadPlan } from "@eristack/ai-knowledge";

const goals = ["invoices", "login", "document numbers"];
const result = recommend(goals);

for (const match of result.matches) {
  console.log(match.recipe.title, match.recipe.packages.map((p) => p.name));
}

const plan = loadPlan(result);
for (const step of plan.steps) {
  console.log(step.loadCommand);
}
```

## Agent path (no TypeScript required)

1. Load `architecture-recommend` when scaffolding or choosing stack/structure
2. Load `recommend-eristack` for feature → package routing
3. Match the user’s A/B/C goals to the live catalog section in that skill
4. Load each listed package skill before coding
5. Load `stack-defaults` for Eristack adapter/money/auth wiring details

## Knowledge files on disk

After install, browse:

- `knowledge/architecture.md`
- `knowledge/recipes.yaml`
- `knowledge/stack-defaults.md`
- `knowledge/agent-workflow.md`
- `knowledge/dev-conventions.md`
- `knowledge/toolbox/`
