# Backseat-first ERP, then derive backend

**Canonical guide — read this file only** for Horizon A → B on document/cost-sheet ERPs (jobs, invoices, forwarding, services). Not an ERP spine recipe; no `@eristack/feature-*`.

For agents: load `@eristack/ai-knowledge#backseat-then-backend` via `recommend()`. Pair with `@eristack/backseat#backseat-core` and `@eristack/ai-knowledge#upgrading-eristack` §3 when wiring adapters.

Cross-cutting companions: [package-relationships](./package-relationships.md), [document-lines-erp](./document-lines-erp.md), [optimistic-document-version](./optimistic-document-version.md), [http-errors](./http-errors.md).

---

## When to use this pattern

| Fit | Examples |
| --- | --- |
| **Yes** | Job → cost sheet → invoice; document lines + QUPS; forwarding/freight; service ERP mockups before API exists |
| **No (unless asked)** | Warehouse GL, stock ledger, FIFO valuation, vertical procure-to-pay modules |
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

**Dependency map first:** `@eristack/ai-knowledge#package-relationships`. **Reference app:** `examples/horizon-a` (`createHorizonBackseat`, `loadHorizonASeedV1`).

Mount pbac + epoch + qups (+ optional jwt) in one call; app routes, doc-number, data-grid lists, and seeds stay in `afterCore`:

```ts
import { createBackseat } from "@eristack/backseat";
import { registerHorizonDocumentSpine, loadHorizonASeedV1 } from "@eristack/backseat/seeds";
import { createPbac } from "@eristack/pbac";

const api = createBackseat({ store, baseUrl: "/api" });
const pbac = createPbac();
// registerTransitionGraph(pbac, …) before spine

await registerHorizonDocumentSpine(api, {
  pbac,
  jwt: { jwtAuth, basePath: "/auth" },
  afterCore: (backseat) => {
    registerDocNumberBackseat(backseat, { docNumber, basePath: "/doc-number" });
    registerYourDataGridRoutes(backseat);
    registerJobRoutes(backseat); // PATCH + versionConflict
  },
});

await api.store.importSnapshot(loadHorizonASeedV1());
```

Install optional peers you register (`@eristack/pbac`, `@eristack/epoch`, `@eristack/qups`, `@eristack/jwt-auth`, `@eristack/doc-number`, `@eristack/data-grid`). Do **not** add workspace devDeps on `@eristack/backseat` for spine packages — turbo build cycle.

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

**Shipped:** `@eristack/backseat/seeds` → `loadHorizonASeedV1()` (`horizon-a-v1.json`). Use in tests and demos; extend with app collections in `afterCore`.

Checklist when adding new demo entities:

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
| `createIndexedDbBackseatStore` | `createDrizzleBackseatStore` (`@eristack/backseat/drizzle`) + `bootWorkshopServer` (`@eristack/backseat/workshop`) |
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

## Derive-backend checklist (Horizon B mirror)

Use this when Express proxies the same routes as Backseat (Tiga Sekawan-style **workshop mirror**). Goal: same paths, same list envelopes, same scope rules — different persistence.

### Document store vs list projections

| Layer | Horizon A | Horizon B (phase 1) |
| --- | --- | --- |
| Canonical JSON docs | IndexedDB collections | `backseat_documents` (or app table) via `@eristack/backseat/drizzle` |
| Register / grid rows | `executeBackseatList` + in-memory joins | Denormalized `*_register_rows` + `executeDrizzleList` |
| Scope | `assignmentScopePrefilter` on prefilter | `assignmentScopeWhere` AND grid `where` |

**Pattern:** keep full documents in one store; maintain **projection tables** for filters/sorts the grid needs. On seed/boot run `rebuild*Index`; after each mutation `upsert*Row` (or rebuild incrementally).

Do not jump to fully normalized job/invoice tables until mirror smoke is green — projections are the default Horizon B phase 1 exit.

### Maturity ladder

1. **Proxy mirror** — Express forwards to headless Backseat (`bootWorkshopServer`) or identical handlers against Drizzle store.
2. **Shared use cases** — extract peeked handler logic; Express and Backseat call the same functions.
3. **Normalized SQL** (optional) — replace projections when product needs reporting beyond grid envelopes.

### Exit criteria (CI)

- [ ] `routesSnapshot()` from Backseat boot matches Express-mounted inventory (`pnpm backseat:routes:check` or `@eristack/backseat/testing` `assertRoutesSnapshotsEqual`).
- [ ] Login → bearer → **GET-only** smoke on safe routes (no default POST probes).
- [ ] List routes return `{ items, pageInfo, query }` — use `assertDataGridEnvelope`.
- [ ] Role × Branch × Trade: same row set from `executeBackseatList` prefilter and Drizzle list with `assignmentScopeWhere`.
- [ ] `pnpm test:api-mirror` (app script) wraps the above; library ships helpers, app owns URLs and tokens.

### Commands (repo helpers)

```bash
# After writing baseline.json (Backseat) and candidate.json (Express boot):
pnpm backseat:routes:check baseline.json candidate.json

# In app package.json:
# "test:api-mirror": "node scripts/express-api-mirror.mjs"
```

Load `@eristack/backseat/drizzle` + `@eristack/backseat/workshop` for server boot; `@eristack/backseat/testing` for snapshot diff and grid envelope asserts.

### Domain document store port

Hexagonal use cases should depend on **`CollectionDocumentStore`** (alias `DocumentStore`) — same methods as `BackseatStore` list/get/create/update/delete/`atomic`. Import types from `@eristack/backseat` or `@eristack/backseat/ports`; wire `createDrizzleBackseatStore` / IndexedDB as adapters. Do not fork `TransactionalStore` shapes in app domain.

Dual-target React transport: `createWorkshopClient` from `@eristack/backseat/client` (`mode: 'backseat' | 'express'`).

### Drizzle app spine bundle (maintainer ADR)

A single “bootstrap all ERP tables” export is **not** shipped yet — compose per-package Drizzle adapters (`jwt-auth`, `doc-number`, `epoch`, …) until an ADR lands. See ticket tier `needs-decision` in maintainer triage.

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
- Vertical `@eristack/feature-*` packages — apps compose the spine

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

- `@eristack/ai-knowledge#package-relationships` — layer map + peer edges
- `@eristack/ai-knowledge#upgrading-eristack` — Backseat train, peers, production path
- `@eristack/ai-knowledge#document-lines-erp` — PATCH sequences on lines ERP
- `@eristack/ai-knowledge#architecture-recommend` — stack defaults
- `@eristack/backseat` docs — controllers, devtools, graduation
