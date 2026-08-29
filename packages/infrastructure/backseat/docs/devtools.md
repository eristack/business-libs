---
title: Devtools
description: Inspect and mutate Backseat data during frontend-first development
---

# Devtools

`<BackseatDevtools />` is a floating panel for **local prototype work** — browse data, insert fixtures, reset, re-seed, and export snapshots without writing migration scripts.

## Quick setup

```tsx
import { BackseatProvider, BackseatDevtools } from "@eristack/backseat/react";
import { api } from "@/backseat/api";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BackseatProvider backseat={api}>
      {children}
      {import.meta.env.DEV ? (
        <BackseatDevtools position="bottom-right" defaultOpen={false} />
      ) : null}
    </BackseatProvider>
  );
}
```

Requires `BackseatProvider` ancestor — uses `useBackseat()` internally.

## Props

| Prop | Default | Description |
| --- | --- | --- |
| `seed` | `createBackseat({ seed })` | Override re-seed source |
| `defaultOpen` | `false` | Start expanded |
| `position` | `"bottom-right"` | `"bottom-left"` also supported |

## Panel layout

```text
┌ Backseat devtools ─────────────── Close ┐
│ Refresh | Reset | Re-seed | Snapshot   │
├─────────────────────────────────────────┤
│ [Data tab]                              │
│   Collection ▼ purchaseOrders (1)       │
│   ┌ po-1001 ───────────────── Delete ┐  │
│   │ PO-1001 · status: approved        │  │
│   └───────────────────────────────────┘  │
│   Insert document (JSON textarea)       │
│   [ Insert into purchaseOrders ]        │
└─────────────────────────────────────────┘
```

Collapsed state shows a **Backseat** floating button in the corner.

## Toolbar actions

| Button | Calls | Use when |
| --- | --- | --- |
| **Refresh** | Reload from store | After external code mutated data |
| **Reset** | `api.reset()` | Empty everything — blank slate |
| **Re-seed** | `api.reseed()` or `seed` prop | Restore demo ERP dataset |
| **Snapshot** | Toggle Data ↔ Snapshot tab | Bulk import/export |

Status messages appear inline (green success / red error).

## Data tab — daily workflows

### Inspect collection

1. Open devtools → pick collection from dropdown
2. Each row shows `id` + preview of other fields
3. Verify Query screens match stored documents

### Insert fixture

Paste JSON with required `id`:

```json
{
  "id": "po-1002",
  "docNumber": "PO-1002",
  "status": "draft",
  "partnerId": "partner-acme",
  "currency": "USD",
  "lines": [
    { "itemId": "prod-desk", "quantity": "1", "unitPrice": "499.00" }
  ]
}
```

Click **Insert into {collection}**. Invalid JSON or missing `id` shows an error.

Use this to:

- Reproduce bug states QA reported
- Add edge-case rows without redeploying
- Test empty vs populated related records

### Delete row

**Delete** on a row calls `store.delete(collection, id)`. Refresh happens automatically.

### Test controller edge cases

Example flow for approval controller:

1. Re-seed demo data
2. Insert job with `status: "draft"`
3. Use app UI to submit — or PATCH via handlers
4. Confirm devtools shows `status: "submitted"`
5. Trigger approve route from UI

## Snapshot tab — bulk operations

### Export for bug tickets

1. Switch to **Snapshot** tab
2. Click **Load snapshot**
3. Click **Copy** — paste into GitHub issue / Slack / agent chat

Agents use snapshots to understand entity shapes and relationships when designing the real backend.

### Import shared fixture

1. Paste JSON snapshot from teammate
2. Click **Import snapshot**
3. All collections replace atomically via `api.seed()`

Snapshot shape:

```json
{
  "partners": [{ "id": "...", "name": "..." }],
  "products": [{ "id": "...", "sku": "..." }],
  "purchaseOrders": [{ "id": "...", "status": "..." }]
}
```

### Reset + re-seed combo

Common recovery:

1. **Reset** — clear corrupted state
2. **Re-seed** — baseline demo
3. Re-apply manual inserts for the specific bug

## Wiring default seed

Pass seed at engine creation so **Re-seed** works without props:

```ts
const api = createBackseat({
  store: createIndexedDbBackseatStore(),
  seed: createErpDemoSnapshot, // function or snapshot
  collections: { /* ... */ },
});
```

Or override per environment:

```tsx
<BackseatDevtools seed={myCustomSalesDemo} />
```

## Production

**Never ship devtools to end users.**

```tsx
{import.meta.env.DEV && <BackseatDevtools />}
```

Storybook is fine — treat it like React Query Devtools.

## Limitations (alpha)

- Devtools **Routes** tab exports `routesSnapshot()` JSON for Horizon B derivation
- No inline document editor — delete + re-insert JSON
- No collection creator UI — collections appear on first insert or seed import

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Re-seed throws | Pass `seed` to `createBackseat` or `<BackseatDevtools seed={...} />` |
| Collection dropdown empty | Reset + re-seed, or insert first document |
| Insert fails "id required" | Add `"id": "unique-string"` to JSON |
| Changes not in UI | Refresh devtools; invalidate React Query keys |
| IndexedDB stale across branches | Change `dbName` or Reset in devtools |

## Related

- [Getting started](./getting-started.md) — provider setup
- [Graduation](./graduation.md) — export snapshots for backend handoff
- [Controllers](./controllers.md) — logic that mutates the data you inspect here
