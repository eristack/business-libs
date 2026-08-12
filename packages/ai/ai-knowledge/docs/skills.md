---
title: Agent skills
description: Intent skills shipped with @eristack/ai-knowledge
sidebar_position: 5
---

# Agent skills

This package ships [Agent Skills](https://agentskills.io) via [TanStack Intent](https://tanstack.com/intent).

| Skill | Use when |
| --- | --- |
| `architecture-recommend` | New app / stack / folder structure — canon TS + Express/Nest + Drizzle + React/Vite/TanStack |
| `recommend-eristack` | User wants to build A/B/C — route to `@eristack/*` first |
| `stack-defaults` | Eristack-specific wiring defaults (money/auth/doc-number adapters) |
| `agent-workflow` | Multi-package work; load order; catalog freshness |
| `dev-conventions` | Monorepo / contribution norms |
| `ai-toolbox` | Prompts, checklists, recipe-authoring template |

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#agent-workflow
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#dev-conventions
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#ai-toolbox
```

After routing, load the **package** skills (`@eristack/money#…`, `@eristack/jwt-auth#…`, `@eristack/doc-number#…`) for deep API guidance.
