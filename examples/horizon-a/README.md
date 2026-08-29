# Horizon A example (`examples/horizon-a`)

Private runnable demo of the **document-with-lines ERP** spine from
[`document-lines-erp`](../../packages/ai/ai-knowledge/knowledge/document-lines-erp.md)
(Horizon A = Backseat mock API before Drizzle/Express).

```bash
pnpm install
pnpm --filter @eristack/example-horizon-a start
```

## Guide mapping

| `document-lines-erp` section | This example |
| --- | --- |
| **Spine — Lines / GP** (`@eristack/qups`) | `src/routes/orders.ts` recalculates lines with `calculateLine` on create/PATCH |
| **Spine — Lists** (`@eristack/data-grid`) | `src/backseat/register.ts` registers `/api/orders-grid` via `executeBackseatList` |
| **Spine — Status rules** (`@eristack/pbac`) | PATCH with `action: "submit"` runs `documents.transitions()` policy before status change |
| **Spine — Mock API** (`@eristack/backseat`) | `createHorizonBackseat()` + `api.handle()` in `src/main.ts` |
| **Spine — Cache** (`@eristack/epoch`) | `epoch.bumpMany(["orders"])` after every order write |
| **Spine — Access** (`@eristack/jwt-auth`) | `/api/auth/*` routes registered (login/session shell for Horizon B parity) |
| **Typical aggregates** (header + lines + version) | `orders` collection: `version`, `lines[]`, `status` |
| **Related — optimistic version** | PATCH requires `expectedVersion`; stale → 409 `CONFLICT_VERSION` (see demo output) |
| **Related — backseat-then-backend** | Same route paths (`/api/orders`, grid envelope) swap store for Drizzle later |

## Layout

- `src/backseat/register.ts` — register spine packages (qups, data-grid, epoch, pbac, jwt-auth)
- `src/routes/orders.ts` — CRUD with QUPS lines, version field, PBAC transition on PATCH
- `src/main.ts` — create engine, seed, exercise handlers via `tsx`

| Not in scope (app-owned or Horizon B): partner/product masters beyond seed stub, doc-number issuance, RBAC/ABAC list prefilters, multitab UI.

Seed data: `@eristack/backseat/seeds` → `loadHorizonASeedV1()` (checked-in `horizon-a-v1.json`).
