# PBAC document transitions (procurement spine)

Canonical guide for **state machines on ERP documents** before `@eristack/feature-*` packages ship. One file — agents wire PO → GR → invoice using `@eristack/pbac` + existing capability packages.

## Model

PBAC policies are **boolean functions over document context** — not per-user RBAC. Register policies once; call `authorize` or `check` on each transition.

```ts
import { createPbac, documents } from "@eristack/pbac";

const pbac = createPbac();

pbac.registerPolicy({
  id: "po.can-approve",
  evaluate: (ctx) =>
    ctx.document.status === "draft" &&
    documents.positiveAmount("totalMinor")(ctx),
});

pbac.registerPolicy({
  id: "po.can-receive",
  evaluate: (ctx) =>
    ctx.document.status === "approved" &&
    documents.positiveAmount("outstandingQty")(ctx),
});

pbac.registerPolicy({
  id: "gr.can-post",
  evaluate: (ctx) =>
    ctx.document.status === "draft" &&
    ctx.related?.purchaseOrder?.status === "approved",
});
```

Express / Nest: `createRequireBusinessPolicy({ pbac, policyId })` → **409** when policy fails.

## Standard procurement statuses

| Document | Statuses (minimal) |
| --- | --- |
| Purchase order | `draft` → `submitted` → `approved` → `closed` / `cancelled` |
| Goods receipt | `draft` → `posted` → `cancelled` |
| Purchase invoice | `draft` → `posted` → `paid` |

App owns tables and UX. Library owns **policy ids** and `check`/`authorize` contracts.

## Transition checklist (PO → GR)

1. **PO approved** — `po.can-approve` passed; doc-number assigned; qups lines calculated with `@eristack/qups`.
2. **GR draft** — lines reference PO line ids; outstanding qty > 0 (`po.can-receive`).
3. **GR post** — `gr.can-post`; for each line call `@eristack/stock-movement` append with **`idempotencyKey`** (e.g. `gr-{grId}-line-{n}`) so HTTP retries do not double-receive.
4. **Verify** — `stock.verify({ locationId, lotId, ownerId })` after post batch.
5. **Invoice** (later) — policy requires GR posted for matched lines; `@eristack/financial-ledger` for AP accrual (app-owned chart).

## Idempotent stock posting

```ts
await stock.append({
  locationId,
  lotId,
  ownerId: itemId,
  inAmount: receivedQty,
  entryType: "goods_receipt",
  entryTypeId: grLineId,
  idempotencyKey: `gr-${grId}-line-${lineNo}`,
});
```

Second call with the same key returns the first ledger entry — safe for at-least-once workers and outbox retries.

## Related packages

| Concern | Package |
| --- | --- |
| Line math | `@eristack/qups` |
| Qty ledger | `@eristack/stock-movement` |
| GL | `@eristack/financial-ledger` |
| COGS / layers | `@eristack/valuations` |
| Doc numbers | `@eristack/doc-number` |
| Lists | `@eristack/data-grid` |
| Login | `@eristack/jwt-auth` |

Full compose narrative: `knowledge/procurement-spine.md`. Feature packages (`@eristack/feature-procurement`) will embed these patterns when they land — still 0.x.

## Agent workflow

1. Load `@eristack/pbac#pbac-core`.
2. Read **this file** for transition ids and GR posting rules.
3. Load `@eristack/stock-movement#stock-movement-core` for append + verify.
4. Do not invent parallel policy engines — export policy ids from app module, evaluate with pbac.
