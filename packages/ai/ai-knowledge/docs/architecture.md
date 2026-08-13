---
title: Architecture
description: Canon app stack for Eristack consumers — layers, TypeScript, Drizzle, TanStack
sidebar_position: 6
---

# Architecture

Default greenfield / brownfield architecture for apps that consume Eristack. Treat this as the **recommended stack** unless the product forces a deliberate exception — and call out exceptions explicitly.

## Non-negotiable layering

**Presentation → Business → Persistence** separation is required.

| Layer | Owns | Must not |
| --- | --- | --- |
| **Presentation** | HTTP/UI adapters, React pages, controllers, DTO mapping | SQL, domain invariants in components |
| **Business** | Use-cases, domain rules, `@eristack/*` core calls | Framework request objects, React hooks, raw SQL |
| **Persistence** | Drizzle schemas, repositories/stores, migrations | UI concerns, route handlers |

Integrate with **typed API contracts** at the boundary — not ad-hoc `any`, not importing persistence into React.

Suggested monorepo shape:

```text
apps/web          # presentation (Vite + React)
apps/api          # presentation (Express or Nest) → business
packages/domain   # business (TypeScript + eristack cores)
packages/db       # persistence (Drizzle + repos)
packages/contracts# shared API types / schemas
```

## Canon stack

### Language & workspace

- **TypeScript** (strict)
- **pnpm** monorepo when there is more than one deployable
- Node `>=20.9` unless constrained

### Backend

- **Express** or **NestJS** (pick one per app)
- **Drizzle ORM**
  - **PostgreSQL** production — Eristack dialect id is **`pgsql`** (not `"pg"`)
  - **SQLite** for tests / local ephemeral runs
- Wire Eristack **adapters** at persistence/presentation edges; keep **cores** in business
- **Memory stores (`createMemory*`) are tests/demos only** — not for production

### Deployment (prefer Vercel)

- Prefer **Vercel** for web / compatible API deployables
- Serverless instances do **not** share process memory — jwt refresh, doc-number sequences, RBAC grants, and similar must live in **hosted Postgres** (Neon, Supabase, Vercel Postgres, …) via Drizzle adapters
- Do not use in-memory maps or local disk as production persistence on Vercel
- `@eristack/ai-workflow` is **local repo memory** for agents — not a Vercel-hosted store

### Frontend

- **React** + **Vite** + **Tailwind** + **shadcn/ui** (compose; don’t fork primitives lightly)
- **Zustand** for client UI state — not a replacement for server state

### TanStack family

| Package | Canon practice |
| --- | --- |
| **Router** | File-based routes |
| **Query** | Server/cache state |
| **Form** | Prefer over ad-hoc forms |
| **Intent** | Load package skills before coding domain areas |

### State split

- Server/cache → TanStack Query  
- Client/UI → Zustand  
- Do not mirror API entity graphs into Zustand “because it’s easier”

### Money / auth / numbers

- Money: strings or minor units — never JS number literals for currency  
- Auth: credentials **child of** app users (`subject`)  
- Doc numbers: formats + sequences; allocate in domain, not only in HTTP  
- Lists: [`@eristack/data-grid`](/docs/data-grid) `{ items, pageInfo, query }`

## Agent load order

1. `architecture-recommend` (this canon)  
2. `recommend-eristack` / `recommend()`  
3. Package skills from the plan  
4. `stack-defaults` when scaffolding  

See [Skills](./skills.md).
