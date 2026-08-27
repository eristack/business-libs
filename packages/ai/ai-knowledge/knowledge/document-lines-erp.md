# Document-with-lines ERP (header + QUPS lines)

**Canonical guide** for job orders, cost sheets, invoices, forwarding — header document + priced lines. Not warehouse GL. Partner/product masters stay **app-owned** until `@eristack/feature-partner` ships.

Load: `@eristack/ai-knowledge#document-lines-erp` · Horizon A mockup: `@eristack/ai-knowledge#backseat-then-backend`.

---

## Spine (generic layers)

| Concern | Package |
| --- | --- |
| Lines / GP | `@eristack/qups` — `calculateLine`, `patchLine`, `applyCellPatch`, `withQupsFields` |
| Money / FX | `@eristack/money` — strings only; `convertAtQuotePerBase` for quote-per-base |
| Document numbers | `@eristack/doc-number` — `{YYYY}` + optional `scope` per branch |
| Lists | `@eristack/data-grid` — `type: wall`, `executeBackseatList` / `executeDrizzleList` |
| Status rules | `@eristack/pbac` — `documents.transitions()` |
| Access | `@eristack/rbac` + `@eristack/abac` (`assignmentPairMatch`) |
| Mock API | `@eristack/backseat` — `atomic()`, `listRoutes()`, `jsonError()` |
| Dates | `@eristack/timestamp` — wall mode for ETD/due; instant for posted_at |
| Cache | `@eristack/epoch` — `bumpMany` after writes |

**Do not default:** `@eristack/stock-movement`, `@eristack/valuations`, `@eristack/financial-ledger` unless inventory/accounting is in scope.

---

## App-owned (until feature packages)

| Master | App schema |
| --- | --- |
| Partner | `isCustomer`, `isVendor`, codes, addresses — not `@eristack/feature-partner` |
| Product / charge codes | App tables or enums |
| Job / cost sheet / invoice | App aggregates + Drizzle migrations |

Libraries supply **line math, lists, auth, numbering** — not vertical tables.

---

## Typical aggregates

```text
Job (header: branch, trade, ETD wall, customerId, status, version)
  └── CostSheet 1:1 (lines: QUPS buy/sell, status, version)
Invoice (header + commercial lines, due_at wall, version)
Partner (app-owned)
```

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

## recommend() goals

Product language that should hit this recipe (not FIFO/stock):

- job order, cost sheet, forwarding, freight, shipment, bill of lading
- document with lines, commercial invoice, service ERP

---

## Related

- `@eristack/ai-knowledge#backseat-then-backend` — Horizon A → B
- `@eristack/ai-knowledge#optimistic-document-version` — `expectedVersion` / 409
- `@eristack/qups#qups-line`, `@eristack/pbac#pbac-core`
