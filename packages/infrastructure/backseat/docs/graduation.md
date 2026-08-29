---
title: Graduation
description: Hand off from Backseat prototype to real backend
---

# Graduation

Backseat exists so **frontend leads**. When Drizzle + Express/Nest is ready, the backend is designed **from what you already built** — not from a shared codegen contract.

## What to preserve

| Artifact | Why |
| --- | --- |
| **DTO shapes** | Fields on documents become API response types |
| **Query keys** | Stable cache keys survive `queryFn` swap |
| **Controller code** | Business rules in `registerRoute` / `registerAction` inform server handlers |
| **Snapshots** | Attach to tickets — agents reproduce exact state |
| **Devtools exports** | Seed data for integration tests on real API |

## Graduation workflow

```text
1. Prototype (Backseat)
   ├── UX + Query flows
   ├── controllers.ts business rules
   └── snapshots for demo states

2. Design real API (human + agent)
   ├── Read Backseat routes + actions
   ├── Read snapshot JSON for entity shapes
   └── Map to Drizzle tables + Express/Nest routes

3. Implement backend
   ├── @eristack/* spine (money, jwt-auth, stock-movement, …)
   └── App-owned domain tables

4. Swap Query layer
   └── queryFn: handlers → REST client (keep queryKey)
```

## Swapping `queryFn`

**Before (Backseat):**

```ts
useQuery({
  queryKey: ["purchaseOrders", { status: "approved" }],
  queryFn: () =>
    api.handlers.purchaseOrders.list({ where: { status: "approved" } }),
});
```

**After (real API):**

```ts
useQuery({
  queryKey: ["purchaseOrders", { status: "approved" }], // unchanged
  queryFn: () =>
    purchaseOrderClient.list({ filter: { status: "approved" } }),
});
```

Same for actions → POST endpoints:

```ts
// Before
api.invoke("operations.outstandingBySupplier", { supplierId });

// After
fetch(`/api/operations/outstanding?supplierId=${supplierId}`);
```

## What agents should peek at

When wiring the real backend, point agents at:

1. **`backseat/controllers/*.ts`** — intended behavior and edge cases
2. **`await api.snapshot()`** — example documents per collection
3. **Query hooks** — which operations the UI actually calls
4. **Route list** — `api.routes()` for HTTP surface area

No automatic OpenAPI generation from Backseat — intentional. The prototype is the sketch.

## Keep Backseat for

| Use | Keep? |
| --- | --- |
| Local dev without backend running | Optional — swap to real API when stable |
| Storybook isolated stories | Yes — memory store + snapshot fixtures |
| E2E demos / sales | Yes — seeded IndexedDB |
| Production user sessions | **No** |

## Testing after graduation

1. Export final prototype snapshot from devtools
2. Use as fixture for real API contract tests
3. Compare response shapes field-by-field
4. Retire Backseat from production bundle; keep in Storybook/dev optionally

## Spine packages

When production backend ships, replace prototype logic with Eristack libraries:

| Prototype in Backseat | Production |
| --- | --- |
| String money on lines | `@eristack/money` |
| `stockMovements` documents | `@eristack/stock-movement` |
| Ad-hoc doc numbers | `@eristack/doc-number` |
| List filters | `@eristack/data-grid` |
| Auth stub | `@eristack/jwt-auth` + `@eristack/rbac` |

Backseat never replaces these — it lets you **defer** them until UX is proven.

## Related

- [Vision](./vision.md) — non-goals
- [Controllers](./controllers.md) — where business rules live during prototype
- [Devtools](./devtools.md) — export snapshots for handoff
