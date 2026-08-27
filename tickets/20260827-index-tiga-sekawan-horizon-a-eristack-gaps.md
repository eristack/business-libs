# Index: Tiga Sekawan Horizon A/B → @eristack suggestion batch (2026-08-27)

> Cover letter for maintainers. This file is **not** a single-package ticket. Each row below is a portable `eristack-ticket suggest` file you can send independently. Feasibility on child tickets is a first-pass gate — do not treat this index as an implementation brief.

## Meta

- **id:** `20260827-index-tiga-sekawan-horizon-a-eristack-gaps`
- **kind:** suggestion-batch-index
- **reporter:** Tiga Sekawan ERP (consumer)
- **created:** 2026-08-27
- **source of product truth:** `IMPLEMENTATION.md` (§4a hexagonal DDD, §4b Backseat-first, §8 money/QUPS, §9 statuses, §10 access, §11 doc-number, §12 HTTP, §14 phases, §19 use cases, §22 schema, §23 UI, §24 data-grid, §25 golden job)
- **discovery:** `PREDEV.md` (spreadsheet Job Order + Cost Sheet; accounting out of v1)
- **cadence:** `.eristack/workflow/summary.md`
- **active sprint:** `2026-08-27-backseat-sea-job-cost-sheet-mockup`
- **ADR:** `.eristack/workflow/sprints/2026-08-27-backseat-sea-job-cost-sheet-mockup/adr/0004-backseat-first.md`
- **how generated:** `pnpm exec eristack-ticket suggest` then fattened with consumer evidence. Older related tickets live in the same folder (2026-08-22 QUPS/money/data-grid).

---

## Why this batch exists

Tiga Sekawan is a **logistics / freight-forwarding ERP**: Master → Job (sea first) → CostSheet 1:1 (buy/sell QUPS lines) → Invoice → settlement → close.

We are **not** building warehouse stock, FIFO layers, or a general ledger in v1. PREDEV excluded accounting. IMPLEMENTATION forbids `@eristack/stock-movement`, `@eristack/valuations`, and `@eristack/financial-ledger` for this product.

Delivery is **two horizons**:

| Horizon | What we ship | Persistence | Eristack we actually touch |
| --- | --- | --- | --- |
| **A (now)** | Clickable mockup: same URL paths as the future API | `@eristack/backseat` IndexedDB | backseat, jwt-auth backseat, qups `calculateLine`/`patchLine`, money, doc-number, data-grid `applyInMemory`, timestamp walls, rbac/pbac, epoch, multitab |
| **B (later)** | Peek Backseat handlers → ports + Drizzle + Express | Postgres | same cores + drizzle/express adapters; flip client base URL |

The pain is not “we need a new `@eristack/feature-job` package.” The pain is **spine gaps** that every Horizon A handler and every Horizon B mapper will copy:

1. **Document aggregates** (job + cost sheet, later invoice + lines) are multi-collection writes. Backseat is per-collection. Domain `UnitOfWork` is Horizon B. Mockup and SQL will lie to each other unless Backseat grows `atomic()`.
2. **Wall dates** (ETD/ETA/`due_at` in `Asia/Jakarta`) are first-class in IMPLEMENTATION and still second-class in timestamp + data-grid (money already got `type: money|decimal` from the 2026-08-22 ticket).
3. **FX snapshot** (`fx_to_idr`, 1 USD = N IDR) is the cost-sheet identity. `Conversion.of` exists; the IDR quote-per-base example in IMPLEMENTATION is still a guess.
4. **Doc-number `{YYYY}`** must be Jakarta calendar year, not UTC. First job of the year is the golden fixture `JO/2026/00001`.
5. **Lists** are the spreadsheet. Horizon A needs Backseat list execution with the same `{items,pageInfo,query}` envelope as `executeDrizzleList`, plus ABAC prefilter (Role × Branch × Trade).
6. **recommend()** still scores **stock-movement 16.4** and **financial-ledger 15.6** for this repo because scaffold goals included inventory and GL. Next agent who runs `pnpm recommend` will pull the wrong spine unless ai-knowledge grows a document-with-lines / Backseat-then-backend recipe.

We filed tickets **first** (this folder). We will **workaround in the app** for anything that does not ship before the active sprint. Do not block Horizon A on these tickets.

---

## What already landed upstream (do not re-file)

These 2026-08-22 consumer tickets are the previous audit. Some have shipped in package versions we now depend on; keep them as provenance.

| File | Package | Topic |
| --- | --- | --- |
| `20260822-112914-suggestion-export-qups-truth-modes-and-isqupstruthmode-5d16e3.md` | `@eristack/qups` | `QUPS_TRUTH_MODES` + `isQupsTruthMode` |
| `20260822-112915-suggestion-amount-only-form-validators-for-shared-currency--d7dca6.md` | `@eristack/money` | amount-only validators for QUPS lines |
| `20260822-112915-suggestion-decimal-or-money-field-type-so-lists-do-not-coer-014fcf.md` | `@eristack/data-grid` | `type: money\|decimal` (shipped in 0.2.x) |
| `20260815-040300-bug-backseat-missing-adapters-export-vite-e2b91c.md` | `@eristack/backseat` | Vite adapters export |
| `20260814-065204-bug-core-import-crashes-in-vite-promisify-scrypt-whe-0d5d09.md` | jwt-auth / vite | scrypt in browser |
| `20260814-071900-suggest-multitab-close-tab-activate-previous-tab-not-first-a3f21c.md` | `@eristack/multitab` | close-tab focus |

Cut plan for wrappers we already invented: `.eristack/plans/2026-08-22-cut-reinvented-eristack-wrappers.md`.

---

## What we are **not** asking for

Do **not** invent these packages from this batch:

- `@eristack/feature-job`, `@eristack/feature-cost-sheet`, `@eristack/feature-shipment`
- `@eristack/concurrency` as a required new package (optimistic `version` is a **recipe** first; see the ai-knowledge ticket)
- A spreadsheet DataGrid inside `@eristack/qups` (app owns `spreadsheet-grid.tsx`)
- Shipping IndexedDB / `createMemory*Store` as production persistence
- Pulling stock/GL “because ERP”

Partner masters stay **app-owned** until a real `feature-partner` exists. The ai-knowledge ticket says so explicitly.

---

## Pain mapped onto the sprint program

### Active: `2026-08-27-backseat-sea-job-cost-sheet-mockup`

Sprint tasks that will copy library-shaped code if tickets miss:

| Sprint task | What we will invent in-app | Upstream ticket |
| --- | --- | --- |
| `model-line-math` | `convertLineToIdr` wrapping guessed `Conversion.of` | money named FX helper |
| `model-line-math` / `ui-cost-sheet` | `applyLinePatch` clone of PO `line-pricing.ts` | qups `applyCellPatch` / patchLine-on-commit |
| `backseat-jobs-routes` createJob | sequential `store.update` job then cost sheet | backseat `atomic()` |
| `backseat-jobs-routes` persist lines | snake_case QUPS fields by hand | qups `withQupsFields` |
| `backseat-jobs-routes` bump epochs | `bumpEpochScopes` already in `apps/web/src/backseat/epoch.ts` | epoch `bumpMany` |
| `backseat-jobs-routes` errors | `{ error: { code, message } }` paste | backseat `jsonError` |
| `backseat-jobs-routes` / `model-job` | `documents.statusIn` × N policies | pbac transition table |
| `backseat-jobs-routes` JO number | hope `{YYYY}` is Jakarta | doc-number IANA period keys |
| `ui-job-register` | applyInMemory + join customerName/GP by hand | data-grid Backseat list + `type: wall` |
| `ui-job-form` ETD/ETA | wall compare / range by hand | timestamp `compareWall` / `addWallDays` (addDays more for invoices) |
| whole sprint | agents still tempted to load stock-movement | ai-knowledge Backseat-then-backend recipe |

Success of this sprint (CS creates sea job, sell+buy lines, GP matches §8.6, submit) does **not** require any of these tickets to merge. They make the mockup honest and Horizon B cheaper.

### Planned: `2026-08-27-backseat-invoices-settlement-close`

- `due_at` = invoice wall date + max TOP `due_days` → **timestamp `addWallDays`**
- invoice header + lines + `cost_sheet_line.invoiced_invoice_id` → **backseat `atomic()` again**
- mixed-currency forbidden (split invoices) — PBAC, not a new package
- HTML print — app chrome, not Eristack

### Planned: `2026-08-27-backseat-access-air-land-reporting`

- Role × Branch × Trade on **list source** (not React sidebar) → **abac assignment-pairs helper**
- Dashboard “departing this week” → **timestamp range + data-grid wall type**

### Planned: `2026-08-27-derive-backend-ports-drizzle-express`

This sprint is where missing library glue becomes real cost:

- Peek handlers → **backseat `listRoutes()` / snapshots**
- Same login against Backseat then Express → **jwt-auth dual-target docs**
- `uow.atomic` vs mockup sequential writes → **backseat `atomic()`** or we rewrite createJob
- `executeDrizzleList` vs hand-rolled IndexedDB filters → **data-grid Backseat list**
- `CONFLICT_VERSION` 409 → **optimistic version recipe**
- Flip client → error envelope must already match

### Planned: `2026-08-27-production-cutover`

Postgres, never memory stores, disable Backseat. No new package request. Scoped sequences only if the client answers IMPLEMENTATION §15 Q8 (per-branch JO numbers).

---

## Catalog of 2026-08-27 tickets

Send these files. Feasibility is the CLI first-pass (`possible` = in-bounds, `partial` = additive/adapter or docs-shaped, not a hard reject).

### `@eristack/backseat` (Horizon A engine)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-140852-suggestion-atomic-multi-collection-writes-for-document-aggr-91d521.md` | partial | `store.atomic` across collections (job + cost sheet) |
| `20260827-140852-suggestion-export-registered-routes-and-handler-snapshots-f-de0821.md` | partial | `listRoutes()` / handler snapshot for Horizon B peek |
| `20260827-141049-suggestion-standard-error-envelope-helper-matching-express--d5663d.md` | possible | `jsonError` matching Express 400/403/409 |

### `@eristack/data-grid` (the spreadsheet register)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-140918-suggestion-wall-or-timestamp-field-type-for-date-range-list-3285b3.md` | possible | field type `wall` / `timestamp` (sibling of money/decimal) |
| `20260827-141023-suggestion-first-class-backseat-in-memory-list-execution-fo-a5c3bf.md` | partial | `executeBackseatList` ≈ `executeDrizzleList` + ABAC prefilter |

### `@eristack/timestamp` (ETD is not `new Date`)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-140852-suggestion-wall-date-calendar-arithmetic-adddays-without-da-c88deb.md` | possible | `addWallDays` for `due_at` |
| `20260827-140852-suggestion-wall-compare-and-inclusive-date-range-helpers-fo-a4385d.md` | possible | `compareWall` / inclusive range for ETD lists |

### `@eristack/money` (golden math)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-140917-suggestion-named-fx-helper-for-quote-per-base-conversion-us-192afd.md` | possible | named FX helper + IDR example (`1500.00` USD × `16250` → `24375000` IDR) |

### `@eristack/qups` (cost sheet is QUPS, not `qty * rate`)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-141023-suggestion-react-patchline-on-commit-helpers-for-spreadshee-b0979b.md` | possible | headless `applyCellPatch` (core, not React-in-core) |
| `20260827-141050-suggestion-indexeddb-plain-object-withqupscolumns-twin-for--2b9e57.md` | possible | `withQupsFields` twin of drizzle `withQupsColumns` |

### `@eristack/doc-number`

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-140917-suggestion-sequence-period-keys-use-a-specified-iana-timezo-e9e9cf.md` | possible | `{YYYY}` in `Asia/Jakarta` |
| `20260827-141049-suggestion-scoped-sequences-branch-or-location-without-a-se-d17d40.md` | partial | optional `scope` on `next()` for per-branch seq (not blocking Horizon A) |

### `@eristack/pbac` / `@eristack/abac` / `@eristack/epoch`

| File | Package | Feasibility | Ask |
| --- | --- | --- | --- |
| `20260827-141023-suggestion-declarative-document-status-transition-table-2956a5.md` | pbac | possible | status transition table (job / cost sheet / invoice) |
| `20260827-140918-suggestion-resource-in-assignment-pairs-helper-for-role-x-b-784143.md` | abac | possible | Role × Branch × Trade `inScope` |
| `20260827-140918-suggestion-bumpmany-scopes-in-one-call-eb665a.md` | epoch | possible | `bumpMany` (we already wrap `Promise.all`) |

### `@eristack/jwt-auth`

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-141024-suggestion-documented-dual-target-client-same-login-against-4dc222.md` | partial | Backseat vs Express auth client parity matrix (docs; maybe tiny API) |

### `@eristack/ai-knowledge` (the agent-facing gap)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260827-141023-suggestion-recipe-backseat-first-erp-mockup-then-derive-dri-448793.md` | possible | recipe Horizon A then B; **do not auto-recommend stock/GL** |
| `20260827-141049-suggestion-feature-partner-and-document-with-lines-placehol-75d93e.md` | possible | `document-lines-erp` recipe; app-owned Partner; `feature-partner` stays coming-soon |
| `20260827-141049-suggestion-optimistic-document-version-recipe-expectedversi-2ca365.md` | partial | `expectedVersion` / `CONFLICT_VERSION` recipe (not a new package unless maintainers want one) |

---

## Maintainer priority (our opinion)

If you only pick five:

1. **ai-knowledge Backseat-then-backend + stop auto-GL/stock** — stops the next consumer agent from scaffolding the wrong ERP.
2. **money named FX / document `Conversion.of` with IDR quote-per-base** — unblocks golden tests we must write this sprint anyway.
3. **timestamp `addWallDays` + `compareWall`** — every date in this product is a wall or an instant; never `Date`.
4. **backseat `atomic()`** — otherwise Horizon A createJob is a known lie.
5. **data-grid `type: wall` + Backseat list execution** — job register is the product, not a side page.

Nice-to-have before Horizon B, not before the sea-job demo: `listRoutes()`, jwt-auth parity docs, pbac transition helper, abac assignment pairs, `withQupsFields`, `bumpMany`, `jsonError`, scoped sequences.

---

## What Tiga Sekawan will invent locally if nothing ships

This is the workaround map so maintainers can see the duplication, not a request to wait.

| Gap | Local workaround (Horizon A) |
| --- | --- |
| Multi-collection write | Try/catch compensation: delete job if cost sheet insert fails |
| `listRoutes` | Grep `registerRoute` in `apps/web/src/backseat/routes` |
| `addWallDays` | Civil-date parser in `packages/domain/src/model` (no `Date`) |
| `compareWall` | String compare `YYYY-MM-DD` after asserting same timezone |
| FX helper | Thin `convertLineToIdr` around whatever `Conversion.of` actually is |
| Jakarta `{YYYY}` | Pass `at` as a Jakarta wall converted to instant if API allows; else document the UTC footgun |
| ABAC pairs | Predicate in every list/get handler |
| `bumpMany` | Keep `bumpEpochScopes` |
| data-grid wall | Filter in `toRow` as strings |
| Backseat list | Load collection + `applyInMemory` in the handler |
| Status table | One `statusIn` policy per command (copy PO) |
| `applyCellPatch` | Copy `applyLinePatch` from purchase-orders into cost-sheet model |
| Auth parity | Two clients; hope paths match |
| Per-branch seq | Company-wide format until Q8 |
| Error envelope | Paste `{ error: { code, message } }` |
| `expectedVersion` | Integer on documents; handler 409 |
| Partner | App tables. Period. |
| `withQupsFields` | Duplicate drizzle column names as a const in domain |

None of these workarounds should become the long-term public API of Tiga Sekawan. Prefer deleting them when the package ships.

---

## Domain facts tickets should not contradict

Copy these into implementation PRs so examples stay honest:

- Money is **decimal strings**. Never JS number literals for currency. `Money.of("19.99", "IDR")`.
- Cost-sheet line math is **`@eristack/qups` `calculateLine` / `patchLine`**. No `qty * rate` in React.
- Golden: `1500.00` USD × `16250` → `24375000` IDR. DOC 11% exclusive `500000` → `555000` IDR. GP `5430000` IDR.
- Mixed-currency invoice is **forbidden** (split invoices).
- ETD/ETA/`due_at` = **wall** `Asia/Jakarta`. `approved_at` = **instant**.
- Job statuses: `draft | open | completed | closed | cancelled` (no stored `in_progress`).
- Cost sheet: `draft → submitted → approved → closed`.
- Invoice: `draft → issued → partially_paid → paid`, or `void`. `partially_paid` is derived from outstanding.
- Access: RBAC verbs + ABAC Role × Branch × Trade + PBAC document rules.
- Optimistic `version` on aggregates. Epoch is **cache**, not write conflict.
- Credentials are a child of app `users`. Never `createMemory*Store` in production. Backseat IndexedDB is prototype-only.
- Domain must not import `contracts`, `db`, Express, React, Drizzle. Horizon A may use PO-style handlers until use cases are extracted.

---

## Current recommend() mismatch (evidence)

`.eristack/knowledge/recommendations.md` (generated 2026-08-22) product goals still include **inventory** and **general ledger**. Matched `erp-modules` primary packages include `@eristack/stock-movement` and supporting `@eristack/financial-ledger`.

Tiga Sekawan v1 primary packages **should** be:

`jwt-auth`, `money`, `qups`, `doc-number`, `data-grid`, `backseat` (Horizon A), `timestamp`, `epoch`, `rbac`, `abac`, `pbac`, `multitab`.

Not: `stock-movement`, `valuations`, `financial-ledger`, hash-chained qty ledgers.

That single catalog bug is why the ai-knowledge tickets are in this batch and why they are high priority even though they ship no runtime.

---

## How to send this to maintainers

1. Attach this index plus the 19 child `.md` files (or a zip of `.eristack/tickets/20260827-*`).
2. Each child file is already `kind: suggestion` with Meta / Summary / User story / Proposed behavior / API / Feasibility / Sketch / Risks / Alternatives / Agent handoff / Consumer evidence.
3. Do **not** implement `needs-decision` new packages from these tickets in Tiga Sekawan.
4. If a ticket is accepted, Tiga Sekawan will delete the local workaround and bump the package — GitHub Flow, Changesets on the library side.

## Related in-repo (not tickets)

- IMPLEMENTATION.md §4b, §12.3, §14 — two horizons
- `.eristack/workflow/backlog/items.yaml` — `eristack-upstream-gaps` points here
- Active sprint plan — copy PO Backseat **shape**, do not grow PurchaseOrder
