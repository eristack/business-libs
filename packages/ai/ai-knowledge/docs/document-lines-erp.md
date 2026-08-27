---
title: Document-with-lines ERP
description: Header + QUPS lines spine for jobs, cost sheets, invoices — not stock/GL
sidebar_position: 5
---

# Document-with-lines ERP (header + QUPS lines)

**Canonical guide** for job orders, cost sheets, invoices, forwarding — header document + priced lines. Partner/product masters stay **app-owned** until `@eristack/feature-partner` ships.

Load: `@eristack/ai-knowledge#document-lines-erp` · Horizon A: [Backseat-first ERP](./backseat-then-backend.md).

---

## Spine (generic layers)

| Concern | Package |
| --- | --- |
| Lines / GP | `@eristack/qups` — `calculateLine`, `patchLine`, `applyCellPatch`, `withQupsFields` |
| Money / FX | `@eristack/money` — `convertAtQuotePerBase` for quote-per-base |
| Document numbers | `@eristack/doc-number` — `{YYYY}` + optional `scope` per branch |
| Lists | `@eristack/data-grid` — `type: wall`, `executeBackseatList` / `executeDrizzleList` |
| Status rules | `@eristack/pbac` — `documents.transitions()` |
| Access | `@eristack/rbac` + `@eristack/abac` (`assignmentPairMatch`) |
| Mock API | `@eristack/backseat` — `atomic()`, `listRoutes()`, `jsonError()` |
| Dates | `@eristack/timestamp` — wall mode for ETD/due |
| Cache | `@eristack/epoch` — `bumpMany` after writes |

**Do not default:** `@eristack/stock-movement`, `@eristack/valuations`, `@eristack/financial-ledger` unless inventory/accounting is in scope.

---

## App-owned (until feature packages)

Partner, product/charge masters, job/cost sheet/invoice tables — libraries supply line math, lists, auth, numbering.

---

## Typical aggregates

Multi-collection create (job + cost sheet):

```ts
await api.store.atomic(async (tx) => {
  await tx.set("jobs", { id, version: 1, ...header });
  await tx.set("costSheets", { id: csId, jobId: id, version: 1, lines: [] });
});
await epoch.bumpMany(["jobs", "cost-sheets"]);
```

Line patch on commit:

```ts
const next = applyCellPatch(line, "unitPrice", edited);
const calculated = calculateLine(next, { truthMode: "unitPrice" });
```

---

## Related

- [Backseat-first ERP](./backseat-then-backend.md)
- [Optimistic document version](./optimistic-document-version.md)
- [@eristack/qups](/docs/qups/getting-started) · [@eristack/pbac](/docs/pbac/getting-started)
