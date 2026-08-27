---
name: backseat-then-backend
description: >
  Backseat-first ERP mockup (Horizon A) then derive Drizzle backend (Horizon B):
  document/cost-sheet/job-order products without stock/GL spine. Skill order,
  atomic writes, wall lists, qups lines — one canonical guide.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/backseat-then-backend.md'
---

# Backseat-first ERP, then derive backend

**Stop.** Load this skill once. Full guide: `knowledge/backseat-then-backend.md`. Not an ERP spine — no `@eristack/feature-*`, no procurement compose.

## When to use

Job order, cost sheet, invoice, forwarding, service ERP mockup, "derive backend", Horizon A → B. **Not** warehouse GL, FIFO, procurement PO→GR unless explicitly scoped.

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#backseat-then-backend
```

## Horizon A skill order

1. `backseat-then-backend` (this)
2. `@eristack/backseat#backseat-core`
3. `@eristack/qups#qups-line`
4. `@eristack/money#money-amounts`, `#money-ledger`
5. `@eristack/doc-number#doc-number-core`
6. `@eristack/data-grid#data-grid-core`
7. `@eristack/rbac#rbac-core`, `@eristack/abac#abac-core`, `@eristack/pbac#pbac-core`
8. `@eristack/timestamp#timestamp-core`, `@eristack/epoch#epoch-core`

## Horizon B

Same HTTP paths — flip stores to Drizzle. Load `@eristack/ai-knowledge#upgrading-eristack` §3 for adapter matrix.

## Do not default-recommend

`stock-movement`, `valuations`, `financial-ledger`, ERP spine recipes — add only when product needs inventory/accounting.
