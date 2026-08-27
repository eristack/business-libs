# Platform roadmap — new packages (greenfield + branches)

> Packages that do **not** exist today. Grouped by layer. Each includes: branches from, unblocks, core API sketch, adapter tier, recipe language.

---

## Branching philosophy

**Branch** = new package extracts repeated consumer patterns from an existing package's domain edge.

**Greenfield** = net-new primitive/capability with no clear single parent.

**Feature** = document family module (deferred until spine gates — listed for completeness).

---

## Primitive layer (new)

### `@eristack/uom` — **branch from qups + feature-product language**

| Field | Detail |
| --- | --- |
| Unblocks | feature-product, feature-manufacturing, qups qty conversions |
| Core | `UnitOfMeasure`, `convertQty(qty, from, to, itemId?)`, `baseUom`, precision rules |
| Adapters | drizzle (Uom table helpers), zod, rest (optional CRUD) |
| Tier | T0-lite (no express unless CRUD API needed) |

```ts
convertQty("12", { value: "1", uom: "BOX" }, { value: "1", uom: "EA" }, itemConversionTable)
// → "144" string qty
```

**Recipe language:** UoM, unit conversion, each, box, kg, liter

---

### `@eristack/fiscal-calendar` — **branch from timestamp**

| Field | Detail |
| --- | --- |
| Unblocks | feature-finance period close, doc-number reset periods |
| Core | `FiscalYear`, `Period`, `openPeriod`, `closePeriod`, `postingDateInOpenPeriod` |
| Adapters | drizzle, zod |
| Tier | T0-lite |

**Recipe language:** fiscal year, period close, posting period, month-end

---

### `@eristack/address` — **greenfield (backlog)**

| Field | Detail |
| --- | --- |
| Unblocks | feature-partner sites, delivery, tax jurisdiction hints |
| Core | structured address lines, country/region validation, formatForPostal |
| Adapters | zod, drizzle columns |
| Tier | T0-lite |

**Recipe language:** address validation, ship-to, bill-to

---

## Capability layer (new)

### `@eristack/tax` — **branch from money + qups line tax**

| Field | Detail |
| --- | --- |
| Unblocks | feature-tax, invoicing, procurement tax codes |
| Core | `TaxCode`, `TaxRate`, `resolveRate(code, date, jurisdiction)`, integrate with qups `Tax.onExclusive` |
| Adapters | drizzle, rest, zod, express, nest, client, react |
| Tier | T1 |

**Why not feature-only:** Tax tables are reused across PO, SO, AP, AR — capability layer.

**Recipe language:** VAT, sales tax, tax code, tax rate table, reverse charge

---

### `@eristack/partner-core` — **branch from ERP master language**

| Field | Detail |
| --- | --- |
| Unblocks | feature-partner (thin), cross-document partner refs |
| Core | `PartnerId` branded type, `PartnerRole` enum, drizzle FK helpers, **not** full CRM |
| Adapters | drizzle, zod |
| Tier | T2 (persistence helpers only) |

**Does not own:** full partner CRUD UI — feature-partner owns documents around master.

---

### `@eristack/bom` — **branch from stock-movement + qups**

| Field | Detail |
| --- | --- |
| Unblocks | feature-manufacturing |
| Core | `BomHeader`, `BomLine`, `explodeBom(qty)`, `consumeAndProduce(workOrder)` postings |
| Adapters | drizzle, backseat |
| Tier | T2 |

**Recipe language:** bill of materials, BOM explosion, work order consume

---

### `@eristack/payment-terms` — **greenfield (backlog)**

| Field | Detail |
| --- | --- |
| Unblocks | feature-ap, feature-ar due dates |
| Core | `NetDays`, `dueDate(invoiceDate, terms)`, discount windows |
| Adapters | core + zod |
| Tier | T0-lite |

---

### `@eristack/serial-lot` — **branch from stock-movement**

| Field | Detail |
| --- | --- |
| Unblocks | traceability, quality holds |
| Core | serial/lot tracking helpers on top of stock locations |
| Adapters | drizzle |
| Tier | T2 extension |

---

## Service layer (new)

### `@eristack/logger` — **planned (priorities.md)**

| Field | Detail |
| --- | --- |
| Unblocks | production ops before REST spread |
| Core | JSON lines, levels, request context injection |
| Adapters | express middleware, nest interceptor, hono |
| Tier | Infrastructure |

---

### `@eristack/rest` — **planned (priorities.md)**

| Field | Detail |
| --- | --- |
| Unblocks | adapter norm, OpenAPI, Hono/Fastify codegen |
| Core | route-as-data, mount, OpenAPI 3.1 emit |
| Adapters | express, nest, hono, fastify?, backseat bridge |
| Tier | Infrastructure |

See [adapters-norm.md](./adapters-norm.md).

---

### `@eristack/outbox` — **branch from posting idempotency need**

| Field | Detail |
| --- | --- |
| Unblocks | reliable GR/invoice posting, webhooks |
| Core | transactional outbox table, `publish(event)`, worker drain pattern |
| Adapters | drizzle, optional redis queue bridge |
| Tier | T1 |

**Recipe language:** outbox, idempotent posting, at-least-once delivery

---

### `@eristack/audit-log` — **branch from hash-chained-ledger pattern**

| Field | Detail |
| --- | --- |
| Unblocks | SOX, change tracking on masters |
| Core | append-only user/action log (who changed partner credit limit) |
| Adapters | drizzle, rest (query API) |
| Tier | T1 |

**Distinct from hash-chained-ledger:** business events, not qty/GL chain.

---

### `@eristack/webhook` — **greenfield (backlog)**

| Field | Detail |
| --- | --- |
| Unblocks | integrations |
| Core | subscription registry, sign payloads, retry — pairs with outbox |
| Adapters | express, nest, drizzle |
| Tier | T1 |

---

### `@eristack/file-store` — **greenfield (backlog)**

| Field | Detail |
| --- | --- |
| Unblocks | attachments on PO/invoice |
| Core | presigned upload interface, metadata table |
| Adapters | s3, vercel blob, local dev |
| Tier | T1 |

---

## UI layer (new)

### `@eristack/doc-shell` — **branch from multitab + data-grid + qups**

| Field | Detail |
| --- | --- |
| Unblocks | every feature module UI |
| Core | layout: header fields + line grid + status bar + tab host; pbac-aware actions |
| Adapters | react, react/tanstack |
| Tier | T5 |

**Not a feature package** — workspace chrome composing existing libs.

---

### `@eristack/data-dense-table` — **backlog UI**

| Field | Detail |
| --- | --- |
| Unblocks | ERP line entry (100+ lines) |
| Core | virtualized grid, keyboard nav, qups column inject |
| Adapters | react |
| Tier | T5 |

---

### `@eristack/command-palette` — **backlog UI**

| Field | Detail |
| --- | --- |
| Unblocks | power-user ERP UX |
| Core | actions registry, doc jump, approve/post commands |
| Adapters | react |
| Tier | T5 |

---

## Infrastructure (new)

### `@eristack/scaffold` — **meta / ai-facing**

| Field | Detail |
| --- | --- |
| Unblocks | agent onboarding, reduce copy-paste from examples |
| Core | CLI: `pnpm dlx @eristack/scaffold app`, emits Express/Nest + Drizzle + TanStack choices |
| Adapters | CLI only |
| Tier | T6 |

**Recipe language:** scaffold eristack app, new monorepo, stack setup

---

### `@eristack/contracts` — **optional shared zod package**

| Field | Detail |
| --- | --- |
| Unblocks | shared Zod wire types without circular deps |
| Core | shared wire types composed from package zod subpaths |
| Tier | T6 |

Only if `./zod` duplication becomes painful across 10+ packages.

---

## Features layer (from roadmap/erp.md)

**Gate:** spine demo + pbac templates + multitab workspace.

| Rank | Package | Depends on (new + existing) |
| ---: | --- | --- |
| 1 | `@eristack/feature-partner` | partner-core, data-grid, jwt-auth |
| 2 | `@eristack/feature-product` | uom, stock-movement, data-grid |
| 3 | `@eristack/feature-procurement` | qups, pbac, doc-number, stock, financial, tax? |
| 4 | `@eristack/feature-sales` | qups, valuations COGS, pbac |
| 5 | `@eristack/feature-inventory` | stock-movement, valuations |
| 6 | `@eristack/feature-finance` | financial-ledger, fiscal-calendar |
| 7 | `@eristack/feature-ap` | procurement, financial, payment-terms |
| 8 | `@eristack/feature-ar` | sales, financial, payment-terms |
| 9 | `@eristack/feature-manufacturing` | bom, stock, qups |
| 10 | `@eristack/feature-pricing` | qups, product, tax |
| 11 | `@eristack/feature-tax` | tax capability (prefer over duplicating) |
| 12–14 | quality, projects, assets | later |

### Shared feature module shape

```text
@eristack/feature-procurement/
  src/core/           document types, state machines, posting orchestration
  src/drizzle/        optional schema helpers (app extends)
  src/pbac/           transition definitions export
  src/data-grid/      list column presets
  src/qups/           line schemas
  docs/               one canonical getting-started
  skills/             feature-procurement-core
```

**Each feature owns:** header/line models, pbac graph, posting calls, list presets  
**Each feature does not own:** users, tenants, email, PDF

---

## Package tree (long-term backlog)

```text
primitive/     money, timestamp, uom, fiscal-calendar, address, payment-terms
capability/    doc-number, qups, stock, financial, valuations, hash-chain,
               tax, partner-core, bom, serial-lot
service/       jwt-auth, data-grid, epoch, rbac, abac, pbac,
               logger, rest, outbox, audit-log, webhook, file-store
infrastructure/ backseat, scaffold
ui/            multitab, doc-shell, data-dense-table, command-palette
features/      partner, product, procurement, sales, inventory, finance, …
ai/            ai-knowledge, ai-workflow, ai-ticket-generator
```

**Count:** 19 today → **~35–40** over years of 0.x iteration (excluding feature long tail). No single release bundles this.

---

## New package priority (before features)

| Priority | Package | Why first |
| --- | --- | --- |
| P0 | `@eristack/rest` | Unblocks adapter consolidation |
| P0 | `@eristack/uom` | Blocks feature-product |
| P0 | `@eristack/tax` | Blocks real invoicing |
| P1 | `@eristack/fiscal-calendar` | Blocks period close |
| P1 | `@eristack/outbox` | Blocks reliable posting |
| P1 | `@eristack/doc-shell` | Blocks ERP UX |
| P1 | `@eristack/partner-core` | Thin master before feature-partner |
| P2 | `@eristack/logger` | Ops |
| P2 | `@eristack/audit-log` | Compliance |
| P2 | `@eristack/scaffold` | Agent onboarding |
| P3 | address, payment-terms, webhook, file-store, bom | As features demand |

---

## Recipe additions for new packages (preview)

| Phrase | Route to |
| --- | --- |
| unit of measure, convert qty | uom |
| VAT, tax code | tax |
| period close, fiscal year | fiscal-calendar |
| idempotent posting | outbox |
| audit who changed | audit-log |
| scaffold app | scaffold |
| document workspace tabs | doc-shell |
| prototype without API | backseat (existing) |
| PO, purchase order | feature-procurement (when shipped) |
