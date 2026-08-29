# Horizon — package draft catalog

> **Planning only.** This file does **not** change shipped layers, site taxonomy, [Priorities](./priorities.md), or npm packages until a human promotes a row into Priorities/Backlog and opens a scaffold PR. Layer **05** stays **UI** in [Layers](./layers.md) until UI/UX rename is explicitly approved.

**Status:** draft · **Not a release calendar.** Candidates become packages only after spine proof (Backseat or `examples/*`) and reprioritization in [Priorities](./priorities.md).

This doc collects **named `@eristack/*` drafts** — yours, Tiga Sekawan signals, and maintainer additions — so agents stop inventing parallel package lists.

## How to read

| Column | Meaning |
| --- | --- |
| **Status** | `Observing` (wait for consumer proof) · `Candidate` (named, API sketch) · `Planned` (sequenced in priorities) · `Shipped` |
| **Layer** | Target layer after [proposed UI → UI/UX rename](#layer-rename-ui--uiux-proposed) |
| **Depends** | Must exist or ship first |
| **Blocks** | Apps or packages waiting on this |

**Reprioritize:** edit tables here and bump ranks in [Priorities](./priorities.md) when sequencing changes.

---

## Meta & governance

### Multi-maintainer collaboration

Eristack is moving from solo-maintainer assumptions to **several maintainers owning layers or packages**.

| Mechanism | Today | Horizon |
| --- | --- | --- |
| Package ownership | `ticket.yaml` per package | **CODEOWNERS** paths → package dirs; required review on exports/API |
| Release notes | Changesets, one file per package | Same + **layer leads** approve Version Packages for their layer |
| Agent routing | `@eristack/ai-knowledge` recipes | Recipes name **one skill**; horizon doc is canonical for *future* packages |
| Conflicting opinions | Ad hoc | **`@eristack/opinion`** encodes HTTP/ID/doc patterns — debates land in opinion PRs, not app repos |
| Support | `@eristack/ai-ticket-generator` | Maintainers subscribe via `ticket.yaml`; feasibility gates feature asks |

**Non-goals:** org chart in repo, Jira replacement, shared staging environments.

### Layer rename: UI → **UI/UX** (proposed)

**Not active** — [Layers](./layers.md) still lists layer 05 as **UI**. Promote this rename only when `@eristack/design-system` (or another UI/UX anchor) is approved to ship.

---

## Opinionated implementation (`@eristack/opinion`)

**Layer:** Service · **Status:** Candidate · **Goal:** strict, boring ERP HTTP — less freestyle in adapters.

Apps still own routes and tables; **opinion** exports route builders, guards, and OpenAPI emitters that enforce the canon.

### REST resource pattern (documents & masters)

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/options` | Field metadata, enums, default sort, filterable columns (forms + grid) |
| `GET` | `/data-grid` | List envelope `{ items, pageInfo, query }` — `@eristack/data-grid` |
| `QUERY` | `/data-grid` | **Future** — POST body query (large filters); same envelope as GET |
| `GET` | `/:id` | Single document or master row |
| `POST` | `/` | Create (draft/default status) |
| `PUT` | `/:id` | Full replace (rare; versioned) |
| `PATCH` | `/:id/:action` | Status transition, line patch, post, cancel — `:action` from pbac/doc-transitions |
| `DELETE` | `/:id` | Soft-delete or cancel when policy allows |

**Rules:**

- Money, qty, dates: string-first types from primitive packages — no raw floats in JSON.
- Mutations that change status: **`PATCH /:id/:action`** only (not ambiguous `PUT`).
- List/read endpoints: **epoch** cache headers or `?epoch=` from `@eristack/epoch`.
- Errors: `@eristack/backseat` envelopes (`jsonError`, `versionConflict`) in prod adapters too.

### Adapter packs (same core)

| Export | Role |
| --- | --- |
| `@eristack/opinion/express` | Router factory + middleware |
| `@eristack/opinion/nest` | Controller decorators / module |
| `@eristack/opinion/openapi` | OpenAPI 3.1 from route table |

Pairs with `@eristack/rest` (Infrastructure) — **rest** mounts servers; **opinion** defines the shape. Typed clients: OpenAPI codegen from merged specs — no separate RPC adapter layer.

---

## Document transition presets (`@eristack/doc-transitions`)

**Layer:** Capability · **Status:** Candidate · **Depends:** `@eristack/pbac` (transitions helper shipped)

Canonical **status vocabularies** + transition graphs for ERP documents — not a BPM engine.

| Preset | States | Typical use |
| --- | --- | --- |
| **Publication** | Draft → Submitted → Published; Cancelled from Draft/Submitted | Customer-facing docs, price lists, BOMs |
| **Decision** | Pending → Approved \| Rejected | Approvals, credit limits, master changes |
| **Outstanding** | Unopened → Open → Closed | Tasks, tickets, period items |
| **Journal** | Unposted → Posted; Voided from Posted | GL journals, inventory postings |
| **Lock** | Unlocked ↔ Locked | Period lock, document freeze |

API sketch:

```ts
import { publicationGraph, journalGraph } from "@eristack/doc-transitions";
// registers with pbac documents.transitions() + app policies
```

**Blocks:** strict opinion PATCH actions; apps use presets instead of stringly statuses.

---

## Package catalog — Primitive

Pure types, IDs, conversions — no HTTP, no Drizzle in core.

| Package | Status | Purpose | Depends | Blocks |
| --- | --- | --- | --- | --- |
| `@eristack/money` | Shipped | Currency-safe amounts | — | all pricing |
| `@eristack/timestamp` | Shipped | Instant + wall time | — | doc dates, grids |
| `@eristack/entity-id` | **Observing** | **UUID v7** primary keys, sortable, URL-safe | — | all new Drizzle tables |
| `@eristack/uom` | **Shipped 0.1.0** | Unit of measure + **fixed ratios** (g, kg, L, pcs) | — | qups qty, product, stock |
| `@eristack/address` | Candidate | Normalized address lines, country/region codes | — | partner, contact |
| `@eristack/contact` | Candidate | Person/channel refs (email, phone roles) | address? | partner |
| `@eristack/coa` | Candidate | Chart of accounts **tree** — code, name, type, parent | entity-id? | accounting, reporting |
| `@eristack/fiscal-calendar` | Candidate | Fiscal year, periods, open/closed flags | timestamp | finance, journal lock |
| `@eristack/percent` | **Shipped 0.1.0** | Basis points / ratio strings (tax, discount) | — | tax, qups |
| `@eristack/geo` | Candidate | Lat/lng + timezone default for address | timestamp | logistics (later) |

### `@eristack/entity-id` (observing)

Waiting on **#project-tiga-sekawan** observation: v7 in Postgres, index behavior, migration from serial/uuid v4.

Deliverables when promoted:

- `EntityId.generate()` · `EntityId.parse()` · Drizzle column helper
- Sort-by-id lists without separate `created_at` index hacks

---

## Package catalog — Capability

Business capabilities composable into documents and ledgers.

| Package | Status | Purpose | Depends | Blocks |
| --- | --- | --- | --- | --- |
| `@eristack/doc-number` | Shipped | Formats, sequences | — | all docs |
| `@eristack/qups` | Shipped | Line math | money | invoices, cost sheets |
| `@eristack/stock-movement` | Shipped | Qty ledger | hash-chained-ledger | inventory |
| `@eristack/financial-ledger` | Shipped | GL amounts | money, HCL | finance |
| `@eristack/valuations` | Shipped | FIFO/LIFO/… | stock, money | COGS |
| `@eristack/doc-transitions` | **Shipped 0.1.0** | Preset status graphs | pbac | opinion PATCH |
| `@eristack/partner` | Candidate | Business partner (supplier + customer roles) | address, contact | app masters |
| `@eristack/item` | Candidate | Product + service, category tree | uom, entity-id | app catalogs |
| `@eristack/accounting` | Candidate | COA assignments, posting rules, period control | coa, financial-ledger, pbac | GL apps |
| `@eristack/tax` | Candidate | Tax codes, inclusive/exclusive on lines | money, qups | invoicing |
| `@eristack/payment-terms` | Candidate | Net 30, cash discount dates | timestamp, money | invoicing apps |
| `@eristack/reporting` | **Candidate** | Query + run report jobs, snapshot rows | data-grid, epoch | DSL |
| `@eristack/reporting-dsl` | **Candidate** | Dynamic report layout (bands, groups, aggregates) | reporting, money | print/PDF |
| `@eristack/serial-batch` | Candidate | Lot/serial beyond stock-movement defaults | stock-movement | regulated industries |
| `@eristack/bom` | Candidate | Bill of materials structure | item | manufacturing |
| `@eristack/landed-cost` | Candidate | Allocate freight/duty to receipt lines | money, valuations | import costing |
| `@eristack/allocation` | Candidate | Distribute header charges to lines | money | invoices, landed cost |

---

## Package catalog — Service

Auth, access, lists, cache, **opinionated HTTP**.

| Package | Status | Purpose | Depends | Blocks |
| --- | --- | --- | --- | --- |
| `@eristack/jwt-auth` | Shipped | Credentials + tokens | — | API |
| `@eristack/rbac` | Shipped | Role permissions | — | API |
| `@eristack/abac` | Shipped | Attribute policies | — | branch/trade scope |
| `@eristack/pbac` | Shipped | Document policies | — | transitions |
| `@eristack/data-grid` | Shipped | Dynamic lists | timestamp | all lists |
| `@eristack/epoch` | Shipped | Cache epochs | — | read models |
| `@eristack/hash-chained-ledger` | Shipped | Append-only chain | — | stock, GL |
| `@eristack/opinion` | **Shipped 0.1.0** | REST canon + OpenAPI compose | data-grid, pbac, jwt-auth | app HTTP |
| `@eristack/audit-event` | Candidate | Domain audit stream (who/when/what) | timestamp, entity-id | compliance |
| `@eristack/outbox` | Candidate | Reliable webhook/email dispatch | — | integrations |
| `@eristack/file-ref` | Candidate | Attachment metadata (app-owned blob store) | entity-id | document scans |
| `@eristack/scheduler` | Candidate | Cron/recurrence as data | timestamp | reporting jobs |
| `@eristack/import-job` | Candidate | CSV/Excel master import pipeline | data-grid | migrations |
| `@eristack/tenant-scope` | Candidate | Company/site scoping helpers for ABAC | abac | multi-company |

---

## Package catalog — Infrastructure

Runtime glue, mock engines, HTTP shells.

| Package | Status | Purpose | Depends | Blocks |
| --- | --- | --- | --- | --- |
| `@eristack/backseat` | Alpha | In-browser REST mock | — | Horizon A demos |
| `@eristack/ai-dev` | Shipped (0.x) | Plan/check/sync CLI + MCP | — | maintainer UX |
| `@eristack/logger` | Planned | JSON lines, request context | — | prod REST |
| `@eristack/rest` | Planned | Mount opinion routes on Express/Nest | opinion | examples |

---

## Package catalog — UI/UX

Design system + headless ERP workspace.

| Package | Status | Purpose | Depends | Blocks |
| --- | --- | --- | --- | --- |
| `@eristack/multitab` | Scaffold | Tab workspace | — | doc UX |
| `@eristack/design-system` | **Candidate** | **Canon Erista** tokens, shadcn recipes, density modes | — | all web ERP |
| `@eristack/doc-shell` | Candidate | Header, status chip, action bar, audit strip | multitab, pbac | document pages |
| `@eristack/form-kit` | Candidate | TanStack Form + opinion `/options` field wiring | opinion, money, timestamp | fast forms |
| `@eristack/data-dense-table` | Candidate | data-grid + design-system table | data-grid, design-system | lists |
| `@eristack/command-palette` | Candidate | ERP navigation / jump to doc | multitab | power users |
| `@eristack/print-view` | Candidate | Print CSS + reporting-dsl preview | reporting-dsl | PDF path |

**`@eristack/design-system`:** single source for color, type, spacing, component variants — syncs with `apps/web` brand tokens (contrast CI already guards drift).

---

## Package catalog — AI

| Package | Status | Purpose |
| --- | --- | --- |
| `@eristack/ai-knowledge` | Shipped | recommend(), recipes, canon guides |
| `@eristack/ai-workflow` | Shipped | Local MCP, sprint memory |
| `@eristack/ai-ticket-generator` | Shipped | Maintainer tickets |
| `@eristack/ai-dev` | Shipped (0.x) | Unified check/plan/sync |
| `@eristack/ai-domain-*` | Candidate | Optional per-app Intent packs |

---

## Sequencing waves (dependency order)

Not dates — **waves** for reprioritization.

```text
Wave 0  (now)     Spine hardening, ai-dev, document-ERP guides, Backseat B
Wave 1  (strict)  opinion (REST) + rest + logger
Wave 2  (ids)     entity-id (after Tiga Sekawan) + doc-transitions
Wave 3  (masters) uom, address, contact, partner, item
Wave 4  (finance) coa, accounting, fiscal-calendar, tax, payment-terms
Wave 5  (UX)      design-system, doc-shell, form-kit
Wave 6  (report)  reporting → reporting-dsl → print-view
```

**Parallel allowed:** design-system (Wave 5) can start during Wave 3 if tokens only; **opinion** should land before app HTTP scaffolding.

**Out of scope for near-term work:** shipping `@eristack/feature-*` npm packages — layer 06 is [under construction](./features.md). Apps compose the spine; horizontal capability drafts below remain in this catalog.

---

## OpenAPI clients

**OpenAPI-first** (default): opinion route table + `mergeOpenApiDocuments` → codegen clients and public API docs. Neither replaces `@eristack/data-grid` list contract — QUERY/GET `/data-grid` stays shared.

---

## Chart of accounts & accounting split

| Concern | Package |
| --- | --- |
| Account **codes, hierarchy, types** (pure) | `@eristack/coa` (Primitive) |
| Posting rules, journals, period close, **pbac config** | `@eristack/accounting` (Capability) |
| Balances, hash-chained entries | `@eristack/financial-ledger` (existing) |

---

## Agents

1. **Future package asks:** read **this file** + [Layers](./layers.md) — do not invent package names in apps.
2. **Implement today:** `recommend()` → shipped spine; for document-with-lines products load `#document-lines-erp` or `#backseat-then-backend`.
3. **Strict HTTP:** when `@eristack/opinion` does not exist, follow the REST table above as convention until the package ships.
4. **Status presets:** prefer `@eristack/pbac` + `documents.transitions()`; when doc-transitions ships, import presets instead of copy-paste graphs.
5. **No vertical modules:** Eristack does not ship `@eristack/feature-*` — apps own procurement, logistics, job costing, and other document families.

When a candidate promotes to Planned, add a row to [Priorities](./priorities.md) and a Changeset-scoped scaffold PR — not a mega-package.

---

## Changelog (planning doc)

| Date | Change |
| --- | --- |
| 2026-08-29 | Dropped Features layer and `@eristack/feature-*` planning — apps compose spine |
| 2026-08-27 | Initial horizon catalog: opinion, entity-id, doc-transitions, masters, reporting, design-system, UI/UX rename, multi-maintainer, tRPC note |
