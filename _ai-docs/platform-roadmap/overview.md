# Eristack platform roadmap (plan only)

> **Status:** Planning · **Execute:** not started  
> **Scope:** All 19 publishable `@eristack/*` packages at **0.x** + planned infrastructure + features layer  
> **Versioning:** Incremental Changesets — minors and patches on 0.x for a long time. **No “2.0” release.** This doc is a backlog, not a semver milestone.  
> **Companion docs:** [tonight.md](./tonight.md) · [backlog.md](./backlog.md) · [audit](./audit.md) · [upgrades](./upgrades.md) · [new-packages](./new-packages.md) · [adapters-norm](./adapters-norm.md)

---

## Executive thesis

Eristack today is a **strong primitive + service spine** with uneven depth on the ledger stack, thin examples beyond auth/lists, and **zero feature-layer packages**. Agents can wire money, auth, and data-grid in ≤3 files — but cannot complete a PO→GR→invoice path without inventing half an ERP.

This roadmap is **not a rewrite or a major version**. It is a sequenced **0.x backlog**:

1. **Harden** what exists (tests, docs, zod, adapter parity) — patch/minor bumps
2. **Extend** core APIs so consumers stop duplicating ERP glue — minor bumps
3. **Normalize** adapters around `/rest` + `/client` spines (+ Hono, optional Prisma) — new packages at 0.1.0
4. **Branch** new primitives/capabilities that unblock feature modules — 0.1.0 alphas
5. **Ship** the features layer in spine-proven slices (procurement first) — `@eristack/feature-*` at 0.1.x

Priority order: [backlog.md](./backlog.md). **Tonight:** [tonight.md](./tonight.md).

---

## Strategic pillars (unchanged, enforced harder)

| Pillar | Roadmap implication |
| --- | --- |
| **Agent-first** | Every new export is recipe-discoverable; canonical guides stay ≤3 files |
| **Drizzle-default** | Prisma/Kysely are opt-in peers, never the skill default |
| **String-first domain** | Money, QUPS, decimals, timestamps — no float drift |
| **Thin adapters** | New framework = mount `/rest` or wrap `/client` — no third HTTP impl |
| **App owns domain** | Libraries inject stores/columns; apps own users, partners, tenants |
| **Spine before verticals** | No `feature-*` until PO→GR demo is runnable |

---

## Horizon map (vision only — not a schedule)

Use [tonight.md](./tonight.md) for what we ship **now**. Use [backlog.md](./backlog.md) for **what’s next** in priority order (no month estimates).

| Phase | Direction |
| --- | --- |
| **Now** | Ledger floor + PO→GR proof + recipes agents can find |
| **Next backlog** | rest package, zod/hono, new primitives (uom, tax), feature layer when gates clear |
| **Eventually** | Full ERP feature stack on 0.x until explicitly graduated |

### Horizon A — Foundation repair (backlog W0)

**Goal:** No package with “1 test file + thin docs” on the ledger critical path.

| Track | Outcome |
| --- | --- |
| Ledger hardening | stock-movement, financial-ledger, valuations, hash-chained-ledger → jwt-auth-level integration tests |
| Zod on HTTP services | jwt-auth, doc-number, data-grid, epoch get `./zod` |
| QUPS surface | express/nest/react **or** documented headless-only + TanStack Form recipe |
| Examples spine | `examples/erp-spine`: PO line → GR posting → stock snapshot (SQLite + Drizzle) |
| Recipe gaps | ai-workflow, hash-chain standalone, scaffolding meta, tax/partner language |

### Horizon B — Adapter norm (backlog W2–W3)

**Goal:** One HTTP trilogy + wire validation everywhere — shipped as 0.x minors on existing packages.

| Track | Outcome |
| --- | --- |
| `@eristack/rest` | Route-as-data, OpenAPI 3.1 emit, pairs with jwt-auth + data-grid |
| `./hono` | Thin mounts for jwt-auth, doc-number, data-grid, epoch |
| `./zod` | Complete on all Tier A packages |
| TanStack Start | Example app + loader/action wiring guide |
| Optional `./prisma` | jwt-auth + doc-number stores first (highest demand) |

See [adapters-norm.md](./adapters-norm.md).

### Horizon C — Infrastructure + UX chrome (backlog W4, W6)

| Track | Outcome |
| --- | --- |
| `@eristack/logger` | JSON lines, request context, Express/Nest middleware |
| Backseat M3 | PO→GR flows, richer seeds, export to Drizzle migration sketch |
| Multitab alpha | `createTabWorkspace`, dirty guards, Router sync, data-grid doc tabs |
| `@eristack/outbox` (new) | Transactional outbox primitive for posting idempotency |

### Horizon D — New primitives & capabilities (parallel, gated)

Branch **from** existing packages — not greenfield reinvention:

| New package | Branches from | Unblocks |
| --- | --- | --- |
| `@eristack/uom` | qups + product language | feature-product, manufacturing |
| `@eristack/tax` | money + qups line tax | feature-tax, invoicing |
| `@eristack/partner-core` | thin refs in jwt-auth/pbac patterns | feature-partner |
| `@eristack/fiscal-calendar` | timestamp | period close, doc-number reset |
| `@eristack/bom` | stock-movement + qups | manufacturing |
| `@eristack/audit-log` | hash-chained-ledger pattern | compliance, SOX |

See [new-packages.md](./new-packages.md).

### Horizon E — Features layer (backlog W7–W8, gated)

**Gate checklist** (from `roadmap/erp.md`):

- [ ] examples or Backseat runs PO → GR → stock snapshot
- [ ] PBAC recipes for PO / GR / invoice states
- [ ] Partner + product schema sketch agreed
- [ ] Multitab + data-grid in example workspace

**P0 ship order:** feature-partner → feature-product → feature-procurement

---

## Package tier model (formalize in docs)

Agents currently guess adapter sets. **The roadmap makes tiers explicit in docs:**

| Tier | Label | Adapter set | Examples |
| --- | --- | --- | --- |
| **T0** | Primitive | drizzle, rest, zod, express, nest, client, react | money, timestamp |
| **T1** | HTTP service | drizzle, rest, express, nest, client, react, backseat | jwt-auth, doc-number, data-grid, epoch |
| **T2** | Domain ledger | drizzle, backseat | qups, stock-movement, financial-ledger, valuations, hash-chained-ledger |
| **T3** | Middleware | drizzle?, express, nest, react, backseat | rbac |
| **T4** | Policy | express, nest, react, backseat | abac, pbac |
| **T5** | UI headless | react | multitab |
| **T6** | Tooling | — | ai-knowledge, ai-workflow, ai-ticket-generator |

Each package `package.json` description + skill should state tier.

---

## Big bets (high leverage, high cost)

### Bet 1 — `@eristack/rest` as HTTP lingua franca

Today every package reimplements Express router glue. Centralizing route-as-data:

- Cuts adapter maintenance 40%+
- Enables OpenAPI + Hono + Fastify from one definition
- Makes Backseat `registerRestLikeRoutes` the browser side of the same contract

### Bet 2 — Ledger family as composable posting bus

Unify stock-movement, financial-ledger, valuations behind:

```ts
createPostingEngine({ stock, financial, valuation, idempotencyKey })
```

Feature modules post once; engine routes to ledgers. Today each feature would wire three packages manually.

### Bet 3 — Document kernel in `@eristack/doc-shell` (UI) + pbac templates

Shared header/line/status machine pattern from `roadmap/erp.md`:

- Not a feature package — a **UI + pbac recipe library**
- Multitab + data-grid + doc-number + qups columns as one workspace template

### Bet 4 — `@eristack/scaffold` (meta package, ai-facing)

CLI + Intent skill that emits:

- Drizzle schema stubs (users child, credentials, doc sequences)
- Express or Nest choice
- TanStack Router + Query + Form wiring
- Backseat toggle for prototype mode

Product language recipe: “scaffold eristack app”, “new ERP monorepo”.

### Bet 5 — Prisma as peer, not co-equal

Ship `./prisma` for **stores only** (jwt-auth credentials, doc-number sequences, rbac assignments) — document Drizzle as default in every skill. Prisma adapters are translation layers over the same store interfaces.

---

## Risk register

| Risk | Mitigation |
| --- | --- |
| Adapter explosion (10 frameworks × 19 packages) | `/rest` + `/client` only behavioral spines; codegen thin mounts |
| Feature packages become mini-monoliths | Strict “owns / does not own” from erp.md; pbac + posting bus |
| Docs drift at 2× package count | Canonical guides per tier; `pnpm docs:sync` + depth tokens rule |
| Backseat mistaken for production | Skills + recipes never default Backseat; graduation guide mandatory |
| Token budget for agents | Tier labels + recommend() + one ERP spine example |

---

## Success metrics (0.x — no version gate)

| Metric | Target |
| --- | --- |
| Agent completes PO→GR integration | ≤5 files, no inventing ledger glue |
| Packages with ≥5 integration tests | 15/19 (exclude ai-tooling) |
| HTTP services with `./zod` | 100% of T0+T1 |
| Recipe coverage | Every publishable package + top 30 ERP product phrases |
| Examples | Express + Nest + React + TanStack Start + Hono |
| Feature alphas | 3 P0 packages with Drizzle-first demos |

---

## What we explicitly defer

- GraphQL gateway
- Vue/Solid first-class (client wrapper only until demand)
- Multi-company consolidation
- Full CRM, HR, MES, WMS, POS
- Replacing TanStack Intent
- Premature 1.0 — stay on Changesets **0.x** until spine + multiple features are production-proven; no calendar “2.0” or “1.0” marketing cut

---

## Navigation

| Doc | Contents |
| --- | --- |
| [audit.md](./audit.md) | Full 19-package audit matrix |
| [upgrades.md](./upgrades.md) | Per-package feature & quality upgrades |
| [new-packages.md](./new-packages.md) | Greenfield + branch packages |
| [adapters-norm.md](./adapters-norm.md) | Target adapter norm, Prisma/Hono/tRPC plan |
| [execution-waves.md](./execution-waves.md) | Sequenced waves with dependencies |
