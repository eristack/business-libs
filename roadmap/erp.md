# ERP features

**Status:** coming soon · **Reprioritize:** edit [Priority stack](#priority-stack) (lower rank = sooner).

## Scope

| In scope | Out of scope |
| --- | --- |
| Operational docs: PO, SO, GR, delivery, invoice, journal, payment | Payroll, full CRM, MES shop-floor |
| Masters: product, partner, warehouse refs | General BPM engine (use pbac + app rules) |
| Posting into stock / GL / valuation ledgers | Replacing Drizzle or auth |

## What each module owns

**Owns:** document models, state machines (pbac), doc-number hooks, qups lines, ledger postings, optional Drizzle helpers, data-grid list recipes.

**Does not own:** users, tenants, FX feeds, email, PDF layout, approval UI chrome.

```text
App (UX, masters extensions)
  └── Features (PO, SO, product, …)
        └── Service (auth, pbac, data-grid, …)
              └── Capability (qups, stock, finance, valuations, doc-number)
                    └── Primitive (money)
```

Naming: `@eristack/feature-<domain>` — one package per cohesive document family, not per screen.

## Priority stack

**Your sort wins.** Change ranks here; bump `P` when you disagree with tier.

| Rank | Package | Domain | P | Spine ready? |
| ---: | --- | --- | --- | --- |
| 1 | `@eristack/feature-partner` | Customer & supplier master | P0 | Partial — partner tables TBD |
| 2 | `@eristack/feature-product` | Item, category, UoM | P0 | Partial — UoM primitive TBD |
| 3 | `@eristack/feature-procurement` | PO, GR, purchase invoice | P0 | Yes |
| 4 | `@eristack/feature-sales` | Quote, SO, delivery, AR invoice | P1 | Yes |
| 5 | `@eristack/feature-inventory` | Transfer, adjustment, stocktake | P1 | Yes |
| 6 | `@eristack/feature-finance` | Journal, period close | P1 | Yes |
| 7 | `@eristack/feature-ap` | Accounts payable | P2 | Needs procurement + finance |
| 8 | `@eristack/feature-ar` | Accounts receivable | P2 | Needs sales + finance |
| 9 | `@eristack/feature-manufacturing` | BOM, work order | P2 | Needs product + BOM capability |
| 10 | `@eristack/feature-pricing` | Price lists | P2 | qups + product |
| 11 | `@eristack/feature-tax` | Tax on documents | P2 | tax capability TBD |
| 12 | `@eristack/feature-quality` | QC hold, inspection | P3 | stock + pbac |
| 13 | `@eristack/feature-projects` | Project on lines | P3 | app-heavy |
| 14 | `@eristack/feature-assets` | Fixed assets | P3 | finance + schedules |

## Module reference

### Masters

| Package | Key entities | Posts to | Recipe language |
| --- | --- | --- | --- |
| feature-partner | Partner, PartnerSite, PartnerRole | — | supplier, customer, vendor |
| feature-product | Item, Category, ItemUom | stock for stock items | SKU, item master, UoM |
| feature-warehouse | Warehouse, Zone/Bin | stock locations | warehouse, bin |

### Procure-to-pay

| Package | Documents | Posts to |
| --- | --- | --- |
| feature-procurement | Requisition, PO, GR, purchase invoice | stock in, GL, AP open item |
| feature-ap | AP open item, payment, credit note | financial-ledger |

**PBAC examples (procurement):** no GR if PO not approved; no GR qty > outstanding; no invoice without GR (policy).

### Order-to-cash

| Package | Documents | Posts to |
| --- | --- | --- |
| feature-sales | Quote, SO, delivery, sales invoice, credit note | stock out, GL, AR, COGS |
| feature-ar | AR open item, receipt | financial-ledger |

### Inventory & finance

| Package | Documents | Posts to |
| --- | --- | --- |
| feature-inventory | Transfer, adjustment, stocktake, reclass | stock-movement |
| feature-finance | Journal voucher, period close, opening balance | financial-ledger |

### Manufacturing, pricing, tax

| Package | Focus | Blocked by |
| --- | --- | --- |
| feature-manufacturing | BOM, work order, consume/produce | BOM capability or local tables |
| feature-pricing | Price lists, effective dates | product master |
| feature-tax | Tax codes on lines | tax capability (prefer over feature-only) |

## Shared document pattern

```text
DocumentHeader   id, docNumber, status, partnerId?, dates, currency
DocumentLine     itemId, qups snapshot, warehouse?, lot?
StateMachine     transitions + pbac per transition
Postings[]       idempotent stock / financial / valuation calls
ListViews        data-grid column presets
```

**Multitab:** one tab per document id + type · **Backseat:** seed open PO/SO/GR for demos · **Prod:** Drizzle + Express/Nest — Features call capability APIs, not Backseat.

## Gates before first feature alpha

- [ ] Backseat seed or `examples/*` runs PO → GR → stock snapshot demo
- [ ] PBAC policy recipes for PO / GR / invoice states
- [ ] Partner or product schema sketch agreed (shared line refs)
- [ ] Multitab + data-grid in example app for document workspace

## Compose today (until Features ship)

| ERP ask | Use now |
| --- | --- |
| Line pricing | `@eristack/qups` |
| Document numbers | `@eristack/doc-number` |
| Qty on hand | `@eristack/stock-movement` |
| COGS / layers | `@eristack/valuations` |
| GL balance | `@eristack/financial-ledger` |
| Can post GR? | `@eristack/pbac` |
| Lists | `@eristack/data-grid` |
| Login | `@eristack/jwt-auth` + `@eristack/rbac` |

## Capability gaps

| Gap | Blocks | Layer |
| --- | --- | --- |
| Partner / address normalization | feature-partner | capability or feature v1 |
| UoM + conversion | feature-product | primitive |
| Tax rate tables | feature-tax, invoices | capability |
| BOM structure | feature-manufacturing | capability |
| Payment allocation glue | AP / AR | money + feature glue |

## Dependencies

```text
partner ──┬── procurement ── AP
product ──┤
          ├── sales ── AR
          └── manufacturing
warehouse ── inventory
finance ── (journal from all modules)
pricing ── sales, procurement
tax ── all invoicing modules
```

## Deferred

| Idea | Why deferred |
| --- | --- |
| feature-hr | Payroll / localization |
| feature-crm | Pipelines ≠ ERP ops |
| feature-wms | Bin automation — inventory ops first |
| feature-pos | Retail channel |
| Multi-company consolidation | App tenancy + reporting |

## Agents

Until `@eristack/feature-*` packages exist, `recommend()` routes ERP language to **spine packages** (table above). When a module ships, add a recipe with product triggers and Intent skills.
