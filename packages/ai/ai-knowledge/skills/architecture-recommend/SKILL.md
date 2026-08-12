---
name: architecture-recommend
description: >
  Recommend the canon app architecture for Eristack/Erista-style products:
  TypeScript, Express or NestJS, Drizzle (Postgres production / SQLite tests),
  mandatory presentation-business-persistence separation, React + Vite +
  Tailwind + shadcn, TanStack Router (file-based) + Query + Form + Intent,
  Zustand for client state, typed API contracts, pnpm monorepo when possible.
  Use when scaffolding a new app, choosing stack, structuring folders, or when
  the user asks how to architect a product that will use @eristack packages.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/architecture.md'
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/stack-defaults.md'
---

# Architecture recommendation

Full guide: `knowledge/architecture.md` in `@eristack/ai-knowledge`.

## Recommend this stack first

| Area | Canon |
| --- | --- |
| Language / repo | TypeScript; **pnpm monorepo** when web/api/shared packages exist |
| API | **Express** *or* **NestJS** (one per app) |
| Persistence | **Drizzle**; **Postgres** production (`"pgsql"`); **SQLite** tests |
| Layering | **Presentation / Business / Persistence** — required |
| UI | **React + Vite + Tailwind + shadcn** (CLI `components/ui`, compose don’t fork) |
| Client state | **Zustand** (UI only) |
| Server state | **TanStack Query** |
| Forms | **TanStack Form** |
| Routing | **TanStack Router — file-based routes** |
| Agents | **TanStack Intent** skills |
| Integration | **Typed API contracts** between web and api |

## Hard rules for agents

1. Do **not** skip layering (no SQL in React; no domain rules only in controllers).
2. Do **not** invent a non-file-based TanStack Router setup when starting fresh.
3. Do **not** put server entity caches in Zustand — use Query.
4. Do **not** mix Express and Nest in the same API app without an explicit user override.
5. After architecture, load `recommend-eristack` for money/auth/doc-number features.

## Suggested layout

```text
apps/web           # Vite React presentation
apps/api           # Express or Nest presentation → business
packages/domain    # business + @eristack cores
packages/db        # Drizzle persistence
packages/contracts # shared API schemas/types
```

## Next skills

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults
```
