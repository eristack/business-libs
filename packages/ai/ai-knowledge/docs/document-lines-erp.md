---
title: Document-with-lines ERP
description: Header + QUPS lines — jobs, cost sheets, invoices
sidebar_position: 5
---
# Document-with-lines ERP (header + QUPS lines)

**Canonical guide** for job orders, cost sheets, invoices, forwarding — header document + priced lines. Not warehouse GL. Partner/product masters stay **app-owned** — Eristack does not ship `@eristack/feature-*` vertical modules.

Load: `@eristack/ai-knowledge#document-lines-erp` · Horizon A mockup: `@eristack/ai-knowledge#backseat-then-backend` · Version conflicts: [optimistic-document-version](./optimistic-document-version.md) · 409 canon: [http-errors](./http-errors.md).

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
| Version | App `version` + `expectedVersion` on PATCH |

**Do not default:** `@eristack/stock-movement`, `@eristack/valuations`, `@eristack/financial-ledger` unless inventory/accounting is in scope.

---

## App-owned masters

| Master | App schema |
| --- | --- |
| Partner | `isCustomer`, `isVendor`, codes, addresses — app tables |
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

---

## End-to-end PATCH sequences

### A. Edit job header only

```text
GET  /jobs/:id           → { …header, version: 3 }
PATCH /jobs/:id          → { expectedVersion: 3, etd: { kind:"wall", local:"2026-09-01", timezone:"Asia/Jakarta" } }
  → 200 { version: 4 }
  → epoch.bumpMany(["jobs"])
```

409 if another tab saved first → `CONFLICT_VERSION` ([http-errors](./http-errors.md)).

### B. Post cost sheet (status + PBAC)

```text
PATCH /cost-sheets/:id   → { expectedVersion: 2, action: "post" }
  → pbac: cost-sheet.can-post (status draft, lines valid)
  → 200 { status: "posted", version: 3 }
  → epoch.bumpMany(["cost-sheets", "jobs"])
```

409 `BUSINESS_POLICY_DENIED` if lines empty or status wrong — show `error.reason`.

### C. Line cell edit (form recalc, then save document)

Client-side on blur (no HTTP yet):

```ts
const next = applyCellPatch(line, "unitPrice", edited);
const calculated = calculateLine(next, { truthMode: "unitPrice" });
```

On document save (header + lines array):

```text
PATCH /cost-sheets/:id   → { expectedVersion, lines: [...], action?: "save" }
  → validate qups invariants server-side (mirror calculateLine)
  → atomic update header version + replace lines OR line-level upsert
  → epoch.bumpMany(["cost-sheets"])
```

Use `store.atomic()` in Backseat when job header and cost sheet must move together.

### D. Create job + cost sheet (multi-collection)

```text
POST /jobs               → { header fields }
  OR Backseat atomic:
```

```ts
await api.store.atomic(async (tx) => {
  const jobId = crypto.randomUUID();
  await tx.set("jobs", { id: jobId, version: 1, status: "draft", ...header });
  await tx.set("costSheets", {
    id: crypto.randomUUID(),
    jobId,
    version: 1,
    status: "draft",
    lines: [],
  });
});
await epoch.bumpMany(["jobs", "cost-sheets"]);
```

### E. Issue invoice number + insert (server transaction)

```ts
return db.transaction(async (tx) => {
  const number = await docNumberFor(tx).next({ entityKey: "invoice", scope: branchId });
  const [invoice] = await tx.insert(invoices).values({
    ...input,
    number: number.value,
    version: 1,
  }).returning();
  return invoice;
});
await epoch.bumpMany(["invoices"]);
```

`next()` never over HTTP — see [doc-number wiring-production](../../capability/doc-number/docs/wiring-production.md).

---

## Multi-collection create (Backseat)

```ts
await api.store.atomic(async (tx) => {
  await tx.set("jobs", { id, version: 1, ...header });
  await tx.set("costSheets", { id: csId, jobId: id, version: 1, lines: [] });
});
await epoch.bumpMany(["jobs", "cost-sheets"]);
```

Epoch bumps **after** atomic — separate store.

---

## List with wall ETD + ABAC scope

```ts
import { executeBackseatList } from "@eristack/data-grid/backseat";
import { matchesAssignmentPair } from "@eristack/abac";

const result = await executeBackseatList({
  store: api.store,
  collection: "jobs",
  schema: jobGridSchema, // etd field: type "wall", timezone "Asia/Jakarta"
  query,
  prefilter: (doc) =>
    matchesAssignmentPair(user.assignments, doc.branchId, doc.trade),
  toRow: async (doc) => ({
    customerName: (await api.store.get("partners", doc.customerId))?.name ?? "",
    etd: doc.etd,
    gpIdr: doc.gpIdr,
  }),
});
```

After any write affecting list membership, `epoch.bump("jobs")` so TanStack Query refetches.

---

## 409 handling matrix

| Code | Trigger | UX |
| --- | --- | --- |
| `CONFLICT_VERSION` | Stale `expectedVersion` on PATCH | Merge dialog / refetch document |
| `BUSINESS_POLICY_DENIED` | Illegal `action` or status gate | Toast `reason`, keep editor open |
| `STALE_EPOCH` | List query older than server epoch | Background refetch grid |
| `POLICY_DENIED` | ABAC scope (wrong branch) | "No access" — not a version issue |

See [http-errors](./http-errors.md) for Express mapper copy-paste.

---

## Seed pack notes (Horizon A)

Minimum demo seed entities for document-lines ERP:

| Collection | Fields agents forget | Packages |
| --- | --- | --- |
| `users` + credentials | `subject` links to user id | jwt-auth backseat |
| `partners` | `branchId` for ABAC demos | app-owned |
| `jobs` | `version: 1`, wall `etd`, `branchId`, `trade` | timestamp, epoch |
| `costSheets` | `lines[]` with QUPS fields via `withQupsFields` | qups |
| `docFormats` | active invoice format per branch | doc-number |
| `epoch` scopes | `jobs`, `cost-sheets`, `invoices` at `0` | epoch |

No checked-in `seed-v1.json` yet — use `@eristack/backseat/seeds` → `loadHorizonASeedV1()` in `examples/horizon-a/` (see [backseat-then-backend](./backseat-then-backend.md)).

PBAC presets to register in seed bootstrap:

```ts
pbac.registerPolicy({
  id: "cost-sheet.can-post",
  evaluate: documents.transitions("status", {
    draft: ["post"],
    posted: [],
  }),
});
```

---

## Line patch on commit

```ts
const next = applyCellPatch(line, "unitPrice", edited);
const calculated = calculateLine(next, { truthMode: "unitPrice" });
```

Persist `withQupsFields(calculated)` in Backseat; `withQupsColumns` in Drizzle line tables for Horizon B.

---

## recommend() goals

Product language that should hit this recipe (not FIFO/stock):

- job order, cost sheet, forwarding, freight, shipment, bill of lading
- document with lines, commercial invoice, service ERP

---

## Production wiring (Horizon B)

| Horizon A | Horizon B |
| --- | --- |
| `executeBackseatList` | `executeDrizzleList` + joins |
| `withQupsFields` | `withQupsColumns` + migrations |
| Backseat PATCH handlers | Express routes + Drizzle transactions |
| IndexedDB seed | Postgres seed script |

Package-specific production guides:

- [jwt-auth wiring-production](../../service/jwt-auth/docs/wiring-production.md)
- [doc-number wiring-production](../../capability/doc-number/docs/wiring-production.md)
- [money wiring-production](../../primitive/money/docs/wiring-production.md)
- [data-grid wiring-production](../../service/data-grid/docs/wiring-production.md)

---

## Related

- [backseat-then-backend](./backseat-then-backend.md) — Horizon A → B
- [optimistic-document-version](./optimistic-document-version.md) — `expectedVersion` / 409
- [http-errors](./http-errors.md) — unified error envelope
- `@eristack/qups#qups-line`, `@eristack/pbac#pbac-core`
