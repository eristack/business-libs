---
title: Backseat-first ERP, then derive backend
description: Horizon A mockup → Horizon B Drizzle for document/cost-sheet ERPs (canonical guide)
sidebar_position: 4
---

# Backseat-first ERP, then derive backend

**Canonical guide — read this file only** for Horizon A → B on document/cost-sheet ERPs (jobs, invoices, forwarding, services). Not an ERP spine recipe; no `@eristack/feature-*`.

For agents: load `@eristack/ai-knowledge#backseat-then-backend` via `recommend()`. Pair with `@eristack/backseat#backseat-core` and `@eristack/ai-knowledge#upgrading-eristack` §3 when wiring adapters.

---

## When to use this pattern

| Fit | Examples |
| --- | --- |
| **Yes** | Job → cost sheet → invoice; document lines + QUPS; forwarding/freight; service ERP mockups before API exists |
| **No (unless asked)** | Warehouse GL, stock ledger, FIFO valuation, procurement PO→GR spine |
| **No** | Production persistence — graduate to Drizzle + Express (Horizon B) |

**Do not** skip app domain math in the mockup. Libraries supply money, qups, timestamps, lists — your `domain/model` owns business rules.

---

## Horizon A — clickable mockup (now)

**Goal:** Same URL paths the future API will expose; UI does not care which adapter sits behind `/api`.

| Layer | Packages |
| --- | --- |
| Engine | `@eristack/backseat` IndexedDB + `registerRoute` / `store.atomic()` / `listRoutes()` / `jsonError()` |
| Auth | `@eristack/jwt-auth/backseat` — see [Dual-target auth](/docs/jwt-auth/dual-target) |
| Lines / pricing | `@eristack/qups` — `calculateLine`, `patchLine`, `applyCellPatch`, `withQupsFields` |
| Money / dates | `@eristack/money`, `@eristack/timestamp` (wall mode — never `Date` for ETD/due) |
| Numbers | `@eristack/doc-number` (`timezone`, optional `scope` on formats) |
| Lists | `@eristack/data-grid/backseat` — `executeBackseatList` + `type: wall` |
| Access | `@eristack/rbac`, `@eristack/abac` (`attrs.assignmentPairMatch`), `@eristack/pbac` |
| Cache | `@eristack/epoch` — `bumpMany` after writes |
| Workspace | `@eristack/multitab` (optional) |

### Skill load order (Horizon A)

1. `@eristack/ai-knowledge#backseat-then-backend` (this file)
2. `@eristack/backseat#backseat-core`
3. `@eristack/qups#qups-line`
4. `@eristack/money#money-amounts` + `#money-ledger`
5. `@eristack/doc-number#doc-number-core`
6. `@eristack/data-grid#data-grid-core`
7. `@eristack/rbac#rbac-core`, `@eristack/abac#abac-core`, `@eristack/pbac#pbac-core`
8. `@eristack/timestamp#timestamp-core`, `@eristack/epoch#epoch-core`

See also [Document-with-lines ERP](./document-lines-erp.md) and [Optimistic document version](./optimistic-document-version.md).

### Multi-collection writes

```ts
await api.store.atomic(async (tx) => {
  await tx.set("jobs", job);
  await tx.set("costSheets", costSheet);
});
await epoch.bumpMany(["jobs", "cost-sheets", "dashboard"]);
```

Epoch bumps **after** atomic — separate store.

### List scope (ABAC)

Enforce Role × Branch × Trade on the **list source**, not only the React sidebar:

```ts
import { matchesAssignmentPair } from "@eristack/abac";

executeBackseatList({
  store,
  collection: "jobs",
  schema,
  query,
  prefilter: (doc) =>
    matchesAssignmentPair(user.assignments, doc.branchId, doc.trade),
  toRow: async (doc) => ({ /* denormalize */ }),
});
```

---

## Horizon B — derive backend (later)

**Goal:** Swap IndexedDB for Drizzle/Postgres; keep handlers and client paths.

1. **Peek** Backseat route handlers — `api.listRoutes()` / Devtools Routes tab.
2. Mount the same paths on Express with `./drizzle` stores.
3. Flip `createJwtAuthClient({ baseUrl })` — paths stay `/auth/login`, etc.
4. Replace `executeBackseatList` with `executeDrizzleList` — same schema + query envelope.

Load [Upgrading](./upgrading.md) for adapter matrix and semver.

---

## What `recommend()` should not push

For job/cost-sheet/invoice products, **do not** default to stock-movement, valuations, financial-ledger, ERP spine recipes, or `@eristack/feature-*`.

---

## Related

- [Upgrading](./upgrading.md) — Backseat train, peers, production path
- [Document-with-lines ERP](./document-lines-erp.md)
- [@eristack/backseat](/docs/backseat/getting-started) — controllers, devtools, graduation
