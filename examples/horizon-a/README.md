# Horizon A example (`examples/horizon-a`)

Private runnable demo of the **document-with-lines ERP** spine from
[`document-lines-erp`](../../packages/ai/ai-knowledge/knowledge/document-lines-erp.md)
(Horizon A = Backseat mock API before Drizzle/Express).

```bash
pnpm install
pnpm --filter @eristack/example-horizon-a start
pnpm --filter @eristack/example-horizon-a test
```

---

## Guide mapping (`document-lines-erp`)

| # | Canonical section | This example |
| --- | --- | --- |
| 1 | **Spine — Lines / GP** (`@eristack/qups`) | `src/routes/orders.ts` — `calculateLine` on create/PATCH; `/api/qups/calculate-line` registered |
| 2 | **Spine — Lists** (`@eristack/data-grid`) | `src/backseat/register.ts` — `GET /api/orders-grid` via `executeBackseatList` |
| 3 | **Spine — Status rules** (`@eristack/pbac`) | PATCH `action: "submit"` / `"approve"` → `documents.transitions()` before status change |
| 4 | **Spine — Mock API** (`@eristack/backseat`) | `createHorizonBackseat()` + `api.handle()` in `src/main.ts` |
| 5 | **Spine — Cache** (`@eristack/epoch`) | `epoch.bumpMany(["orders"])` after writes; `createHorizonEpochClient` + cache-policy demo |
| 6 | **Spine — Access** (`@eristack/jwt-auth`) | `/api/auth/login` + demo credentials in `src/main.ts` |
| 7 | **Spine — Dates** (`@eristack/timestamp`) | `postedAt` wall field on orders + grid schema `type: "wall"` |
| 8 | **Typical aggregates** (header + lines + version) | `orders` collection: `version`, `lines[]`, `status`, `postedAt` |
| 9 | **End-to-end PATCH — submit** | `main.ts` + `tests/epoch-cache.test.ts` — submit draft → epoch bump |
| 10 | **409 — CONFLICT_VERSION** | PATCH with stale `expectedVersion` → 409 (see demo output) |
| 11 | **409 — BUSINESS_POLICY_DENIED** | Illegal transition (e.g. approve while still draft after submit) via PBAC |
| 12 | **Epoch + TanStack Query** | `tests/epoch-query.test.tsx` — `useEpochCachePolicy` → `refetch` after write |
| 13 | **Seed pack** | `@eristack/backseat/seeds` → `loadHorizonASeedV1()` (`horizon-a-v1.json`) |
| 14 | **Horizon B graduation** | Same route paths swap store for Drizzle — see [backseat-then-backend](../../packages/ai/ai-knowledge/knowledge/backseat-then-backend.md) |

**Not in scope (app-owned or Horizon B):** doc-number issuance, RBAC/ABAC list prefilters, multitab UI, partner master beyond seed stub.

---

## Layout

| Path | Role |
| --- | --- |
| `src/backseat/register.ts` | Register spine packages (qups, data-grid, epoch, pbac, jwt-auth) |
| `src/routes/orders.ts` | CRUD with QUPS lines, version field, PBAC transitions |
| `src/lib/epoch-client.ts` | `createHorizonEpochClient(api)` — epoch client over `api.fetch` |
| `src/main.ts` | Seed, exercise handlers, epoch cache-policy + auth login |
| `tests/spine.test.ts` | `listRoutes()` coverage (≥12 spine routes) |
| `tests/epoch-cache.test.ts` | Headless cache-policy: use-cache → refetch |
| `tests/epoch-query.test.tsx` | TanStack Query `useEpochCachePolicy` integration |

---

## Related guides

- [document-lines-erp](../../packages/ai/ai-knowledge/knowledge/document-lines-erp.md)
- [backseat-then-backend](../../packages/ai/ai-knowledge/knowledge/backseat-then-backend.md)
- [optimistic-document-version](../../packages/ai/ai-knowledge/knowledge/optimistic-document-version.md)
- [http-errors](../../packages/ai/ai-knowledge/knowledge/http-errors.md)
