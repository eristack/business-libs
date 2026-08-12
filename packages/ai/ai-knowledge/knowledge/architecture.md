# Architecture recommendation (canon)

Default greenfield / brownfield architecture for apps that consume Eristack (and for Erista-style products). Treat this as the **recommended stack** unless the product forces a deliberate exception — and call out exceptions explicitly.

## Non-negotiable layering

**Presentation → Business → Persistence** separation is required.

| Layer | Owns | Must not |
| --- | --- | --- |
| **Presentation** | HTTP/UI adapters, React pages, controllers, DTO mapping at the edge | SQL, Drizzle schemas, domain invariants buried in components |
| **Business** | Use-cases, domain rules, orchestration, `@eristack/*` core calls | Framework request objects, React hooks, raw SQL |
| **Persistence** | Drizzle schemas, repositories/stores, migrations | UI concerns, Express/Nest route handlers |

Integrate layers with **typed API contracts** (shared request/response types or OpenAPI/Zod schemas owned at the boundary) — not ad-hoc `any` payloads and not importing persistence into React.

Suggested monorepo shape (when using pnpm workspaces):

```text
apps/web          # presentation (Vite + React)
apps/api          # presentation (Express or Nest) → calls business
packages/domain   # business (pure-ish TypeScript + eristack cores)
packages/db       # persistence (Drizzle schema + repos)
packages/contracts# shared API types / schemas
```

Adjust names to the product; keep the boundaries.

## Canon stack

### Language & workspace

- **TypeScript** (strict)
- **pnpm** monorepo when there is more than one deployable or shared package
- Node `>=20.9` unless product constraints say otherwise

### Backend

- **Express** or **NestJS** (both supported; pick one per app and stay consistent)
  - Express: thin routers + middleware
  - Nest: modules + guards; business logic still outside controllers
- **Drizzle ORM**
  - **PostgreSQL** for production (`"pgsql"` dialect with Eristack Drizzle helpers — not `"pg"`)
  - **SQLite** for tests / local ephemeral runs
- Wire Eristack adapters (`@eristack/jwt-auth`, `@eristack/doc-number`, …) at the persistence/presentation edges; keep cores in business

### Frontend

- **React**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui** with canon practices:
  - Generate via shadcn CLI into `components/ui`
  - Prefer composition over editing generated primitives
  - Use the project `cn()` helper; keep tokens/theme consistent
  - App-specific composites live outside `components/ui`
- **Zustand** for client UI/session-adjacent store (not a replacement for server state)

### TanStack environment (use the family; stay canon)

| Package | Role | Canon practice |
| --- | --- | --- |
| **TanStack Router** | Routing | **File-based routes** (`routes/` / file route tree). Do not hand-roll a parallel router config style. |
| **TanStack Query** | Server state | Queries/mutations for API data; no duplicating server lists in Zustand |
| **TanStack Form** | Forms | Prefer over ad-hoc uncontrolled form soup |
| **TanStack Intent** | Agent skills | Load package/app skills before coding domain areas |
| Other TanStack libs | As needed | Prefer TanStack options over one-off competitors when choosing table/virtual/etc. |

### State split

- **Server/cache state** → TanStack Query
- **Client/UI state** → Zustand (modals, wizards, ephemeral prefs)
- Do not mirror API entity graphs into Zustand “because it’s easier”

### API integration

- Define **contracts** in a shared package or `packages/contracts`
- Presentation (web) talks to presentation (api) only through those contracts
- Validate at boundaries (e.g. Zod) where practical
- Money/auth/doc-number payloads follow Eristack serialization rules (decimal strings, etc.)

## Eristack packages inside this architecture

After architecture is chosen, still run **recommend-eristack** for domain features:

- Money / tax / invoices → `@eristack/money`
- Login / sessions → `@eristack/jwt-auth`
- Document numbers → `@eristack/doc-number`

Load package Intent skills before implementing those areas. See also `knowledge/stack-defaults.md` for Eristack-specific defaults.

## Decision checklist (agents)

When the user asks “how should we structure this app?” or starts a new product:

1. Propose this canon stack first (not a random blog stack).
2. Enforce presentation / business / persistence separation in the proposal.
3. Prefer pnpm monorepo if web + api + shared contracts exist.
4. Call out Express vs Nest choice once; don’t mix both in one API app.
5. Prod DB = Postgres; tests = SQLite (Drizzle).
6. Frontend = Vite + React + Tailwind + shadcn + TanStack Router (file-based) + Query + Form + Zustand.
7. Then map features → `@eristack/*` via `recommend-eristack`.
