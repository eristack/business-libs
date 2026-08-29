# Platform backlog — vision reference (not scheduled)

> **Superseded (2026-08-29):** W7–W8 / W11 feature-module waves removed. See `roadmap/backlog.md` deferred row.

> **Do not execute from this file in one session.** Use [tonight.md](./tonight.md) for active work.  
> Waves are **priority order**, not calendar estimates. All ships on **0.x** Changesets.

---

## Wave index

| Wave | Theme | Unblocks |
| --- | --- | --- |
| W0 | Ledger hardening (tests, docs, idempotency) | feature postings |
| W1 | Generic consumer gaps (backseat atomic, data-grid wall, doc-number TZ) | document ERPs |
| W2 | `@eristack/rest` | adapter consolidation |
| W3 | zod + hono on T1 packages | wire validation, edge |
| W4 | Backseat M3 + rest route parity | prototype ERP |
| W5 | uom, tax, fiscal-calendar, outbox, partner-core | feature masters |
| W6 | multitab beta + doc-shell | workspace UX |
| W7 | logger, audit-log | ops |
| W8 | prisma peer stores | consumer choice |
| W9 | scaffold CLI, recipe expansion | agent onboarding |

Full detail per wave: former content in git history of `execution-waves.md` — condensed below.

---

## W0 — Ledger hardening

- hash-chained-ledger: recipe, canonical guide, tests
- stock-movement: idempotency, docs hub, tests
- financial-ledger: trialBalance, getting-started depth, tests
- valuations: COGS helper, method tests, ERP guide
- optional: postgres in CI

## W1 — Generic layer gaps (deferred ERP spines)

- backseat: `store.atomic()` multi-collection writes — **done**
- data-grid: `type: wall`, Backseat list envelope — **done**
- doc-number: period keys in IANA timezone — **done**
- qups: headless `applyCellPatch`, `withQupsFields` — **done**
- ai-knowledge: Backseat-then-backend guide + recipe — **done**
- abac: `matchesAssignmentPair`, `attrs.assignmentPairMatch` — **done**
- jwt-auth: dual-target client docs — **done**
- backseat: `listRoutes()` / `routesSnapshot()`, `jsonError()` — **done**
- doc-number: optional `scope` on `next()` + `{SCOPE}` — **done**
- ai-knowledge: `document-lines-erp`, `optimistic-document-version` recipes — **done**

**Removed:** `@eristack/feature-*` vertical modules — apps compose spine packages.

## W2–W4 — Adapter + infra

- `@eristack/rest` route-as-data
- zod on jwt-auth, doc-number, data-grid, epoch
- hono mounts; Backseat uses same route table

## W5–W7 — New packages + infra

- See [new-packages.md](./new-packages.md)
- No vertical feature-module gates — apps own document families

## W8–W9 — Ops + long tail

- logger, audit-log, prisma peers, scaffold, recipes

---

## Dependency sketch

```text
W0 + W1 ──► W5 capability drafts
W2 ──► W3, W4
```

---

## Quality bar (when a package is “hardened”)

From [upgrades.md](./upgrades.md): ≥5 integration tests, getting-started with Drizzle path, skill + recipe, zod if T1, exports:check green.
