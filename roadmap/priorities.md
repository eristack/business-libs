# Priorities

What we are doing now and what comes next. Infrastructure milestones live here — not a separate doc.

## Now

| Item | Layer | Notes |
| --- | --- | --- |
| Ledger family hardening | Capability + Service | Stock, financial, valuations on Drizzle-default hash chain |
| ai-knowledge catalog | AI | Packages, recipes, docs+sync every iteration |
| Seven-layer taxonomy | Meta | Site + docs aligned to layer order |
| `@eristack/backseat` | Infrastructure | Alpha — in-browser REST engine + IndexedDB store |
| `@eristack/multitab` | UI | Scaffold — tab workspace |

## Next (sequenced)

| # | Item | Layer | Why |
| ---: | --- | --- | --- |
| 1 | **Backseat engine** | Infrastructure | UX and feature prototyping without API deploy |
| 2 | **Multitab engine** | UI | Document workspace chrome every ERP screen needs |
| 3 | **`@eristack/logger`** | Infrastructure | Production visibility before REST spread |
| 4 | **`@eristack/rest`** | Infrastructure | One HTTP shell pattern for examples and features |

### 1 · Backseat (scaffold → alpha)

| Milestone | Deliverable |
| --- | --- |
| M1 | `createBackseat`, memory/IndexedDB store, CRUD + custom routes/actions ✓ |
| M2 | Devtools panel, ERP seed packs, snapshot export ✓ (devtools + basic seed) |
| M3 | Richer demo flows (PO → GR) — no shared REST contract yet |

**Non-goals:** production auth, replacing Drizzle, server deploy.

### 2 · Multitab (scaffold → alpha)

- `createTabWorkspace` headless model
- Dirty close guards + TanStack Router sync hooks

### 3 · Logger (planned)

| Requirement | Notes |
| --- | --- |
| JSON lines | One event per line for Vercel log drains |
| Context | `requestId`, `userId`, `tenantId` injectable |
| Levels | debug / info / warn / error |
| Adapters | Express middleware, Nest interceptor |

### 4 · REST (planned)

- Route definition as data → mount on Express / Nest
- Optional OpenAPI 3.1 emit for client codegen
- Pairs with jwt-auth guards and data-grid list actions

## Not next

- Full `@eristack/feature-*` package until Backseat or `examples/*` proves the spine path
- GraphQL gateway — REST + typed clients first
- Replacing TanStack Intent — skills stay the guidance layer

## Onboarding

[/start](/start) on the site — pnpm monorepo, selective `@eristack/*` installs, Intent / ai-knowledge. Not a package.
