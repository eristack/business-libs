---
title: Vision
description: Design constraints for the Backseat engine
---

# Vision

## Why Backseat exists

ERP frontend work stalls when every screen waits on API deploys. Teams reach for MSW tapes or ad-hoc mocks — then Query keys, DTOs, and business rules diverge from what production will need.

Backseat is an **in-browser backend sketch pad**:

- Persistent enough for multi-day prototype sessions (IndexedDB)
- Structured enough to feel like real CRUD + workflows (store, router, controllers)
- Flexible enough for complex ERP logic (custom routes, named actions)
- Inspectable enough for humans and agents (devtools, snapshots)

## Goals

1. **Frontend-first** — UX and TanStack Query flows lead; Drizzle + Express/Nest follow.
2. **Flexible controllers** — not a rigid CRUD generator. Your approval, posting, and report logic lives in `registerRoute` / `registerAction`.
3. **Query-native** — direct handlers and `invoke` as first-class citizens; HTTP when helpful.
4. **Seedable + inspectable** — demo seeds, devtools panel, snapshot export/import.
5. **Agent-friendly handoff** — when backend work starts, agents read handler code and snapshots — no mandatory shared route contract.

## Non-goals

| Non-goal | Instead |
| --- | --- |
| Production persistence | Drizzle + Postgres |
| Real auth / RBAC | `@eristack/jwt-auth`, `@eristack/rbac` |
| Server-side validation | App + capability packages on real API |
| Schema migrations | Snapshots during prototype; Drizzle migrations in prod |
| Rigid CRUD-only API | Collections are optional shortcuts |
| OpenAPI/codegen contract now | Backend designed later from prototype artifacts |
| Replacing MSW for network-level E2E | Backseat complements — owns stateful fake backend |

## Frontend-first timeline

```text
Phase A — Backseat (now)
  Build screens, controllers, seeds
  Devtools for fixtures
  Snapshots attached to design docs / tickets

Phase B — Spine (parallel or after UX validation)
  money, jwt-auth, stock-movement, doc-number on real API

Phase C — Graduation
  Swap Query queryFn to REST client
  Agents map Backseat controllers → Express/Nest routes
  Retire Backseat from production bundle
```

Backseat is **throwaway infrastructure** for speed — but the **decisions** (DTOs, workflows, query keys) are keepers.

## Relationship to Eristack layers

```text
Primitive/Capability/Service  →  production domain (money, stock, auth, …)
Infrastructure/backseat       →  browser sketch while frontend leads
Features/*                    →  may prototype against Backseat first
AI / agents                   →  peek at snapshots + controllers when backend starts
```

Backseat does not compete with capability packages — it **defers** them until UX proves the workflow.

## Devtools philosophy

The devtools panel is not a nice-to-have — it is how non-developers and agents participate:

- PM inserts a PO in `draft` to test approval UX
- QA resets to seed between test runs
- Maintainer exports snapshot with bug report
- Agent imports snapshot to reason about entity graph

Gate devtools from production builds; keep them always available in dev.

## Success criteria

Backseat succeeds when:

- A procurement PO → approve → list refresh works entirely client-side
- Query keys survive graduation to real API unchanged
- An agent can read `controllers.ts` + snapshot JSON and draft Drizzle schema + routes
- Devtools reset + re-seed takes less than 5 seconds

## Related

- [Graduation](./graduation.md) — prototype → production workflow
- [Architecture](./architecture.md) — technical layering
- [Controllers](./controllers.md) — where business logic lives
