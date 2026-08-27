# Backseat-first ERP, then derive backend

**Canonical guide — read this file only** for Horizon A → B on document/cost-sheet ERPs (jobs, invoices, forwarding, services). Not an ERP spine recipe; no `@eristack/feature-*`.

For agents: load `@eristack/ai-knowledge#backseat-then-backend` via `recommend()`. Pair with `@eristack/backseat#backseat-core` and `@eristack/ai-knowledge#upgrading-eristack` §3 when wiring adapters.

Cross-cutting companions: [document-lines-erp](./document-lines-erp.md), [optimistic-document-version](./optimistic-document-version.md), [http-errors](./http-errors.md).

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
| Auth | `@eristack/jwt-auth/backseat` — see jwt-auth dual-target |
| Lines / pricing | `@eristack/qups` — `calculateLine`, `patchLine`, `applyCellPatch`, `withQupsFields` |
| Money / dates | `@eristack/money`, `@eristack/timestamp` (wall mode — never `Date` for ETD/due) |
| Numbers | `@eristack/doc-number` (`timezone` on yearly formats) |
| Lists | `@eristack/data-grid/backseat` — `executeBackseatList` + `type: wall` |
| Access | `@eristack/rbac`, `@eristack/abac` (`attrs.assignmentPairMatch`), `@eristack/pbac` |
| Cache | `@eristack/epoch` — `bumpMany` after writes |
| Version | App `version` on aggregates — `versionConflict()` on PATCH |
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
9. `@eristack/ai-knowledge#optimistic-document-version`, `#http-errors`

### Bootstrap sketch

```ts
import { createBackseat } from "@eristack/backseat";
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";
import { registerDocNumberBackseat } from "@eristack/doc-number/backseat";
import { registerEpochBackseat } from "@eristack/epoch/backseat";
import { registerDataGridBackseatRoutes } from "@eristack/data-grid/backseat";

const api = await createBackseat({ name: "horizon-a-demo" });

registerJwtAuthBackseat(api, { jwtAuth, basePath: "/auth" });
registerDocNumberBackseat(api, { docNumber, basePath: "/doc-number" });
registerEpochBackseat(api, { epoch, basePath: "/epoch" });
registerJobRoutes(api); // your PATCH handlers with versionConflict
await seedHorizonA(api);
```

---

## Multi-collection writes + epoch

```ts
await api.store.atomic(async (tx) => {
  await tx.set("jobs", job);
  await tx.set("costSheets", costSheet);
});
await epoch.bumpMany(["jobs", "cost-sheets", "dashboard"]);
```

Epoch bumps **after** atomic — separate store. Same order in Express transactions.

---

## PATCH + 409 demo flow

Wire one resource end-to-end so graduation keeps behavior:

```ts
import { jsonError, versionConflict } from "@eristack/backseat";

api.registerRoute({
  method: "PATCH",
  path: "/jobs/:id",
  handler: async (ctx) => {
    const { expectedVersion, action, ...patch } = await ctx.json();
    const job = await ctx.store.get("jobs", ctx.params.id);
    if (!job) return jsonError({ status: 404, code: "NOT_FOUND", message: "Not found" });
    if (Number(job.version) !== Number(expectedVersion)) return versionConflict();

    if (action === "post") {
      const gate = await pbac.check("job.can-post", { document: job, action });
      if (!gate.allowed) {
        return jsonError({
          status: 409,
          code: "BUSINESS_POLICY_DENIED",
          message: gate.reason ?? "Denied",
        });
      }
    }

    const next = { ...job, ...patch, version: job.version + 1 };
    await ctx.store.update("jobs", job.id, next);
    await epoch.bumpMany(["jobs"]);
    return ctx.json(200, next);
  },
});
```

Client test: open two tabs, save both → second gets `CONFLICT_VERSION`. See [http-errors](./http-errors.md).

---

## List scope (ABAC)

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

## Seed pack (Horizon A)

No versioned seed file in repo yet — use this checklist when building `examples/horizon-a/`:

| Step | Action |
| --- | --- |
| 1 | Seed user + jwt-auth credentials (`demo` / `password123`) |
| 2 | Seed partners with `branchId` for ABAC |
| 3 | Register doc-number formats per `entityKey` + branch `scope` |
| 4 | Seed jobs `{ version: 1, etd: wall, branchId, trade }` |
| 5 | Seed cost sheets `{ jobId, version: 1, lines: [] }` with `withQupsFields` |
| 6 | Initialize epoch scopes: `jobs`, `cost-sheets`, `invoices` → `0` |
| 7 | Register PBAC policies (`cost-sheet.can-post`, …) |
| 8 | Call `api.listRoutes()` — export for Horizon B contract spec |

```ts
async function seedHorizonA(api: Backseat) {
  await api.store.set("jobs", {
    id: "job-1",
    version: 1,
    status: "draft",
    branchId: "CGK",
    trade: "export",
    etd: { kind: "wall", local: "2026-09-15", timezone: "Asia/Jakarta" },
    customerId: "partner-1",
  });
  await epoch.bumpMany(["jobs", "cost-sheets", "invoices"]);
}
```

Document seed ids in README so agents replay PATCH demos consistently.

---

## Horizon B — derive backend (later)

**Goal:** Swap IndexedDB for Drizzle/Postgres; keep handlers and client paths.

1. **Peek** Backseat route handlers / `listRoutes()` — they are the contract spec.
2. Mount the same paths on Express with `./drizzle` stores.
3. Flip `createJwtAuthClient({ baseUrl })` from `/api` (Backseat shim) to real server URL — paths stay `/auth/login`, etc.
4. Replace `executeBackseatList` with `executeDrizzleList` — same schema + query envelope.
5. Reuse [http-errors](./http-errors.md) mapper — identical JSON bodies.

| Horizon A | Horizon B |
| --- | --- |
| `createIndexedDbBackseatStore` | Drizzle tables + stores |
| `register*Backseat(api)` | `create*Router` / Nest modules |
| `executeBackseatList` | `executeDrizzleList` |
| `withQupsFields` | `withQupsColumns` + migrations |
| `versionConflict()` in handler | Same + SQL `WHERE version` |

Production wiring guides (copy-paste end-to-end):

- `@eristack/jwt-auth` → `docs/wiring-production.md`
- `@eristack/doc-number` → `docs/wiring-production.md`
- `@eristack/money` → `docs/wiring-production.md`
- `@eristack/data-grid` → `docs/wiring-production.md`

Load `@eristack/ai-knowledge#upgrading-eristack` for adapter matrix and semver.

---

## Graduation checklist

- [ ] Every Backseat route has Express equivalent path + method
- [ ] Error bodies match `jsonError` / `versionConflict` shape
- [ ] `expectedVersion` on all PATCH routes
- [ ] `epoch.bumpMany` after writes (same scopes as Horizon A)
- [ ] List schema unchanged (`type: wall` fields preserved)
- [ ] Auth client `baseUrl` only change for React app
- [ ] Drizzle migrations for app tables + library tables (jwt-auth, doc-number, epoch)
- [ ] Memory stores removed from production bundle

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
| Inline `{ error: string }` bodies | `jsonError` / [http-errors](./http-errors.md) |
| Skip `version` in seed data | Always `version: 1` on mutable docs |

---

## Related

- `@eristack/ai-knowledge#upgrading-eristack` — Backseat train, peers, production path
- `@eristack/ai-knowledge#document-lines-erp` — PATCH sequences on lines ERP
- `@eristack/ai-knowledge#architecture-recommend` — stack defaults
- `@eristack/backseat` docs — controllers, devtools, graduation
