# Platform backlog — vision reference (not scheduled)

> **Do not execute from this file in one session.** Use [tonight.md](./tonight.md) for active work.  
> Waves are **priority order**, not calendar estimates. All ships on **0.x** Changesets.

---

## Wave index

| Wave | Theme | Unblocks |
| --- | --- | --- |
| W0 | Ledger hardening (tests, docs, idempotency) | feature postings |
| W1 | `examples/erp-spine` PO→GR | roadmap gates |
| W2 | `@eristack/rest` | adapter consolidation |
| W3 | zod + hono on T1 packages | wire validation, edge |
| W4 | Backseat M3 + rest route parity | prototype ERP |
| W5 | uom, tax, fiscal-calendar, outbox, partner-core | feature masters |
| W6 | multitab beta + doc-shell | workspace UX |
| W7 | feature-partner, feature-product | masters |
| W8 | feature-procurement | first ERP vertical |
| W9 | logger, audit-log | ops |
| W10 | prisma peer stores | consumer choice |
| W11 | feature sales/inventory/finance… | O2C, P2P |
| W12 | scaffold CLI, recipe expansion | agent onboarding |

Full detail per wave: former content in git history of `execution-waves.md` — condensed below.

---

## W0 — Ledger hardening

- hash-chained-ledger: recipe, canonical guide, tests
- stock-movement: idempotency, docs hub, tests
- financial-ledger: trialBalance, getting-started depth, tests
- valuations: COGS helper, method tests, ERP guide
- optional: postgres in CI

## W1 — Spine demo

- examples/erp-spine: Express + Drizzle + React
- qups lines, GR → stock-movement, pbac cookbook
- data-grid lists, jwt-auth

## W2–W4 — Adapter + infra

- `@eristack/rest` route-as-data
- zod on jwt-auth, doc-number, data-grid, epoch
- hono mounts; Backseat uses same route table

## W5–W8 — New packages + features

- See [new-packages.md](./new-packages.md)
- Gates: `roadmap/erp.md` checklist before feature-*

## W9–W12 — Ops + long tail

- logger, audit-log, prisma peers, scaffold, recipes

---

## Dependency sketch

```text
W0 + W1 ──► W8 feature-procurement
W2 ──► W3, W4
W5 + W6 + W7 ──► W8
```

---

## Quality bar (when a package is “hardened”)

From [upgrades.md](./upgrades.md): ≥5 integration tests, getting-started with Drizzle path, skill + recipe, zod if T1, exports:check green.
