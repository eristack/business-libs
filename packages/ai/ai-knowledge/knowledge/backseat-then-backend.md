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
| Auth | `@eristack/jwt-auth/backseat` — see [jwt-auth dual-target](../service/jwt-auth/docs/dual-target.md) |
| Lines / pricing | `@eristack/qups` — `calculateLine`, `patchLine`, `applyCellPatch`, `withQupsFields` |
| Money / dates | `@eristack/money`, `@eristack/timestamp` (wall mode — never `Date` for ETD/due) |
| Numbers | `@eristack/doc-number` (`timezone` on yearly formats) |
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

1. **Peek** Backseat route handlers / actions — they are the contract spec.
2. Mount the same paths on Express with `./drizzle` stores.
3. Flip `createJwtAuthClient({ baseUrl })` from `/api` (Backseat shim) to real server URL — paths stay `/auth/login`, etc.
4. Replace `executeBackseatList` with `executeDrizzleList` — same schema + query envelope.

| Horizon A | Horizon B |
| --- | --- |
| `createIndexedDbBackseatStore` | Drizzle tables + stores |
| `register*Backseat(api)` | `create*Router` / Nest modules |
| `executeBackseatList` | `executeDrizzleList` |
| `withQupsFields` | `withQupsColumns` + migrations |

Load `@eristack/ai-knowledge#upgrading-eristack` for adapter matrix and semver.

---

## What `recommend()` should not push

For job/cost-sheet/invoice products, **do not** default to:

- `@eristack/stock-movement`, `@eristack/valuations`, `@eristack/financial-ledger`
- ERP spine / procurement compose recipes
- `@eristack/feature-*` (not shipped)

Add inventory/GL only when product goals explicitly include warehouse or accounting.

---

## Anti-patterns

| Don't | Do |
| --- | --- |
| `new Date(wall.local)` for filters | `type: wall` + `@eristack/timestamp` |
| Sequential `store.create` for job + cost sheet | `store.atomic()` |
| Scope only in UI nav | `prefilter` / ABAC on list + get |
| Duplicate QUPS field names in IndexedDB | `withQupsFields(line)` |
| Two auth clients for A vs B | One `createJwtAuthClient`, change `baseUrl` |

---

## Related

- `@eristack/ai-knowledge#upgrading-eristack` — Backseat train, peers, production path
- `@eristack/ai-knowledge#architecture-recommend` — stack defaults
- `@eristack/backseat` docs — controllers, devtools, graduation
