---
title: Architecture
description: Canon app architecture recommendation for agents and apps
sidebar_position: 6
---

# Architecture

`@eristack/ai-knowledge` ships a **canon architecture** for products that will use Eristack packages.

## Load the skill

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
```

## Summary

- TypeScript + pnpm monorepo when possible
- Express **or** NestJS
- Drizzle: Postgres in production, SQLite in tests
- Mandatory **presentation / business / persistence** separation
- React + Vite + Tailwind + shadcn (canon CLI practices)
- TanStack Router (**file-based**), Query, Form, Intent
- Zustand for client/UI state only
- Typed **API contracts** between web and api

Full detail lives in the published knowledge file:

- `knowledge/architecture.md`

Eristack package wiring defaults remain in [stack defaults](./skills.md) / `knowledge/stack-defaults.md`. Domain feature routing stays with `recommend-eristack`.
