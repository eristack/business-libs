# Package candidates — catalog (120+)

Numbered brainstorm rows. **Not npm packages.** Shipped rows included so agents see the full map.

| Col | Meaning |
| --- | --- |
| **#** | Stable brainstorm id (not priority rank) |
| **Status** | `shipped` · `idea` · `sketch` (in horizon.md) · `TS` tag in Notes |
| **Notes** | TS = Tiga Sekawan signal · **H** = in `roadmap/horizon.md` |

---

## 01 · Primitive (35)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| P01 | `@eristack/money` | shipped | Currency-safe amounts, tax/discount ops | |
| P02 | `@eristack/timestamp` | shipped | Instant + wall time, DST-safe | |
| P03 | `@eristack/entity-id` | sketch | UUID v7 generate/parse, Drizzle column | TS · **H** |
| P04 | `@eristack/uom` | sketch | Units + fixed conversion ratios (g, kg, L, pcs) | TS · **H** |
| P05 | `@eristack/quantity` | idea | String decimal qty (distinct from money) | pairs with uom |
| P06 | `@eristack/address` | sketch | Normalized postal lines, country/region | TS · **H** |
| P07 | `@eristack/contact` | sketch | Person/channel roles on a party | TS · **H** |
| P08 | `@eristack/person-name` | idea | Structured given/family, salutation | |
| P09 | `@eristack/org-name` | idea | Legal vs trade name | |
| P10 | `@eristack/phone` | idea | E.164 parse/format | |
| P11 | `@eristack/email-address` | idea | Normalized email + local-part rules | |
| P12 | `@eristack/bank-account` | idea | Account number + routing metadata | |
| P13 | `@eristack/iban` | idea | IBAN validate/format | |
| P14 | `@eristack/tax-id` | idea | NPWP/VAT/EIN string validators | |
| P15 | `@eristack/coa` | sketch | Account code tree, type enum | TS · **H** |
| P16 | `@eristack/fiscal-calendar` | idea | Fiscal year + periods | **H** |
| P17 | `@eristack/business-calendar` | idea | Working days, holidays | |
| P18 | `@eristack/percent` | idea | Basis points / ratio strings | |
| P19 | `@eristack/geo` | idea | Lat/lng, geohash optional | |
| P20 | `@eristack/locale-format` | idea | Number/date display intents | |
| P21 | `@eristack/sku` | idea | Stock keeping unit code rules | |
| P22 | `@eristack/barcode` | idea | EAN/UPC/GS1 parse | |
| P23 | `@eristack/hs-code` | idea | Harmonized tariff codes | |
| P24 | `@eristack/incoterms` | idea | EXW/FOB/CIF enum | |
| P25 | `@eristack/reason-code` | idea | Standard adjustment reason ids | |
| P26 | `@eristack/document-type` | idea | Doc family codes (PO, SO, JV) | |
| P27 | `@eristack/serial-number` | idea | Serial identity string rules | |
| P28 | `@eristack/lot-number` | idea | Lot/batch identity string rules | |
| P29 | `@eristack/dimension` | idea | L×W×H string triple + uom | |
| P30 | `@eristack/weight` | idea | Weight value + uom | |
| P31 | `@eristack/volume` | idea | Volume value + uom | |
| P32 | `@eristack/etag` | idea | Row version / optimistic lock token | |
| P33 | `@eristack/slug` | idea | URL-safe identifiers | |
| P34 | `@eristack/enum-pack` | idea | Registered enum sets with labels | |
| P35 | `@eristack/allocation-weight` | idea | Weights that sum to 100% for splits | money allocate |

---

## 02 · Capability (60)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| C01 | `@eristack/doc-number` | shipped | Document number formats + sequences | |
| C02 | `@eristack/qups` | shipped | Line pricing qty/unit/price math | |
| C03 | `@eristack/stock-movement` | shipped | Qty hash-chained ledger | |
| C04 | `@eristack/financial-ledger` | shipped | GL money ledger | |
| C05 | `@eristack/valuations` | shipped | FIFO/LIFO/FEFO layers | |
| C06 | `@eristack/doc-transitions` | sketch | Preset status graphs (Publication, Journal, …) | TS · **H** |
| C07 | `@eristack/partner` | sketch | Business partner supplier/customer | TS · **H** |
| C08 | `@eristack/item` | sketch | Product/service master + category | TS · **H** |
| C09 | `@eristack/warehouse` | idea | Location hierarchy (WH/zone/bin) | |
| C10 | `@eristack/accounting` | sketch | Posting rules, periods, pbac config | TS · **H** |
| C11 | `@eristack/tax` | idea | Tax codes on lines | **H** |
| C12 | `@eristack/payment-terms` | idea | Net 30, cash discount | **H** |
| C13 | `@eristack/pricelist` | idea | Effective-dated prices | |
| C14 | `@eristack/discount-scheme` | idea | Header/line discount rules | qups |
| C15 | `@eristack/rebate` | idea | Accrued vendor rebates | |
| C16 | `@eristack/commission` | idea | Sales commission accrual | |
| C17 | `@eristack/credit-limit` | idea | Partner exposure check | partner |
| C18 | `@eristack/allocation` | sketch | Header charge → line splits | **H** |
| C19 | `@eristack/landed-cost` | sketch | Freight/duty to GR lines | **H** |
| C20 | `@eristack/bom` | sketch | Bill of materials explosion | **H** |
| C21 | `@eristack/serial-batch` | idea | Serial/lot tracking helpers | **H** |
| C22 | `@eristack/kitting` | idea | Kit/assembly BOM consume | bom |
| C23 | `@eristack/mrp` | idea | Material requirements pegging | |
| C24 | `@eristack/replenishment` | idea | Min/max reorder suggestions | |
| C25 | `@eristack/cycle-count` | idea | ABC cycle count schedules | |
| C26 | `@eristack/pick-pack-ship` | idea | Fulfillment wave logic | |
| C27 | `@eristack/carrier` | idea | Carrier + service level refs | |
| C28 | `@eristack/freight-rate` | idea | Lane-based freight tables | |
| C29 | `@eristack/customs` | idea | Import duty declarations | |
| C30 | `@eristack/intercompany` | idea | IC due-to/due-from rules | |
| C31 | `@eristack/transfer-pricing` | idea | IC price lists | |
| C32 | `@eristack/budget` | idea | Budget vs actual envelopes | |
| C33 | `@eristack/cost-center` | idea | Cost center allocation | |
| C34 | `@eristack/profit-center` | idea | Profit center reporting slice | |
| C35 | `@eristack/project-code` | idea | Project on lines | |
| C36 | `@eristack/asset-register` | idea | Fixed asset master | |
| C37 | `@eristack/depreciation` | idea | Depreciation schedules | |
| C38 | `@eristack/bank-reconciliation` | idea | Statement vs ledger match | |
| C39 | `@eristack/dunning` | idea | AR collection letters | |
| C40 | `@eristack/cash-application` | idea | Payment → invoice match | money |
| C41 | `@eristack/recurring-billing` | idea | Subscription invoice generation | |
| C42 | `@eristack/contract` | idea | Sales/purchase contract headers | |
| C43 | `@eristack/quality-inspection` | idea | QC results on GR | |
| C44 | `@eristack/non-conformance` | idea | NCR workflow data | |
| C45 | `@eristack/return-authorization` | idea | RMA qty return rules | |
| C46 | `@eristack/warranty` | idea | Warranty period on serial | |
| C47 | `@eristack/engineering-change` | idea | ECO effectivity on BOM | |
| C48 | `@eristack/blanket-order` | idea | Release against blanket PO | |
| C49 | `@eristack/consignment` | idea | Consignment stock ownership | |
| C50 | `@eristack/three-way-match` | idea | PO–GR–invoice tolerance | |
| C51 | `@eristack/reporting` | sketch | Report query + job runner | TS · **H** |
| C52 | `@eristack/reporting-dsl` | sketch | Band/group/aggregate layout DSL | TS · **H** |
| C53 | `@eristack/approval-matrix` | idea | Who can approve what threshold | abac |
| C54 | `@eristack/substitution` | idea | Item substitute rules | |
| C55 | `@eristack/delegation` | idea | Temporary approver delegation | |
| C56 | `@eristack/lease` | idea | IFRS16-style lease schedules | |
| C57 | `@eristack/subscription-metering` | idea | Usage meters → invoice lines | |
| C58 | `@eristack/expense-policy` | idea | Per-diem / category caps | |
| C59 | `@eristack/payroll-export` | idea | GL export only (not payroll calc) | |
| C60 | `@eristack/shop-floor` | idea | Operation reporting qty | |

---

## 03 · Service (38)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| S01 | `@eristack/jwt-auth` | shipped | JWT + credentials | |
| S02 | `@eristack/rbac` | shipped | Role permissions | |
| S03 | `@eristack/abac` | shipped | Attribute policies | |
| S04 | `@eristack/pbac` | shipped | Document policies | |
| S05 | `@eristack/data-grid` | shipped | Dynamic list queries | |
| S06 | `@eristack/epoch` | shipped | Cache epoch counters | |
| S07 | `@eristack/hash-chained-ledger` | shipped | Append-only hash chain | |
| S08 | `@eristack/opinion` | sketch | REST canon + OpenAPI + tRPC | TS · **H** |
| S09 | `@eristack/audit-event` | idea | Domain audit stream | **H** |
| S10 | `@eristack/outbox` | idea | Reliable outbound events | **H** |
| S11 | `@eristack/file-ref` | idea | Attachment metadata | **H** |
| S12 | `@eristack/scheduler` | idea | Cron/recurrence as data | **H** |
| S13 | `@eristack/import-job` | idea | CSV/Excel master import | **H** |
| S14 | `@eristack/export-job` | idea | Bulk export jobs | |
| S15 | `@eristack/tenant-scope` | idea | Company/site scope helpers | **H** |
| S16 | `@eristack/webhook` | idea | Signed inbound webhooks | |
| S17 | `@eristack/api-key` | idea | Service API keys | |
| S18 | `@eristack/rate-limit` | idea | Token bucket limiter | |
| S19 | `@eristack/idempotency` | idea | Idempotency-Key store | |
| S20 | `@eristack/correlation` | idea | Request/causation id helpers | |
| S21 | `@eristack/notification` | idea | Multi-channel notify dispatch | |
| S22 | `@eristack/email-template` | idea | Handlebars-style templates | |
| S23 | `@eristack/print-queue` | idea | Async print/PDF jobs | |
| S24 | `@eristack/pdf-render` | idea | HTML→PDF adapter interface | |
| S25 | `@eristack/edi` | idea | EDI parse/generate (X12/EDIFACT lite) | |
| S26 | `@eristack/oauth-bridge` | idea | OAuth2 client for integrations | |
| S27 | `@eristack/scim` | idea | SCIM provisioning hooks | |
| S28 | `@eristack/pii-mask` | idea | Redact logs/responses | |
| S29 | `@eristack/retention` | idea | Data retention policies | |
| S30 | `@eristack/feature-flag` | idea | Flag evaluation service | |
| S31 | `@eristack/read-model` | idea | Projector from events → SQL | |
| S32 | `@eristack/saga` | idea | Multi-step compensating flows | |
| S33 | `@eristack/dead-letter` | idea | Failed job replay | |
| S34 | `@eristack/health` | idea | Health/readiness aggregators | |
| S35 | `@eristack/metrics` | idea | Prometheus-style counters | |
| S36 | `@eristack/signature-verify` | idea | Webhook HMAC verify | |
| S37 | `@eristack/consent` | idea | GDPR consent log | |
| S38 | `@eristack/label-zpl` | idea | ZPL label payload builder | |

---

## 04 · Infrastructure (14)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| I01 | `@eristack/backseat` | shipped | In-browser mock REST | |
| I02 | `@eristack/ai-dev` | shipped | plan/check/sync CLI + MCP | |
| I03 | `@eristack/logger` | idea | JSON line logger | priorities |
| I04 | `@eristack/rest` | idea | Mount opinion routes | priorities · **H** |
| I05 | `@eristack/queue` | idea | Queue abstraction (SQS/Rabbit) | |
| I06 | `@eristack/blob-ref` | idea | S3/R2 signed URL helpers | |
| I07 | `@eristack/search-index` | idea | FTS adapter (Meilisearch/…) | |
| I08 | `@eristack/migration-runner` | idea | Drizzle migrate wrapper | |
| I09 | `@eristack/seed-pack` | idea | Versioned demo seed bundles | backseat |
| I10 | `@eristack/fixture-loader` | idea | Test fixture JSON loader | |
| I11 | `@eristack/contract-test` | idea | OpenAPI contract test harness | opinion |
| I12 | `@eristack/chaos-hook` | idea | Fault injection for tests | |
| I13 | `@eristack/vercel-adapters` | idea | Vercel serverless helpers | |
| I14 | `@eristack/drizzle-kit-helpers` | idea | Shared drizzle config snippets | |

---

## 05 · UI (30)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| U01 | `@eristack/multitab` | scaffold | Tab workspace headless | |
| U02 | `@eristack/design-system` | sketch | Canon Erista tokens + shadcn | TS · **H** |
| U03 | `@eristack/doc-shell` | idea | Doc header, status, actions | **H** |
| U04 | `@eristack/form-kit` | idea | TanStack Form + /options | **H** |
| U05 | `@eristack/data-dense-table` | idea | data-grid + table UX | **H** |
| U06 | `@eristack/command-palette` | idea | Jump/nav palette | **H** |
| U07 | `@eristack/print-view` | idea | Print CSS + report preview | **H** |
| U08 | `@eristack/line-grid` | idea | Spreadsheet line editor | qups · TS |
| U09 | `@eristack/kanban` | idea | Status column board | |
| U10 | `@eristack/gantt` | idea | Schedule bars | |
| U11 | `@eristack/calendar-view` | idea | Month/week resource calendar | timestamp wall |
| U12 | `@eristack/org-chart` | idea | Hierarchy chart | |
| U13 | `@eristack/tree-picker` | idea | COA/category tree select | |
| U14 | `@eristack/master-detail` | idea | Split list + form layout | |
| U15 | `@eristack/attachment-panel` | idea | File list + upload shell | file-ref |
| U16 | `@eristack/audit-timeline` | idea | Who/when/status timeline | |
| U17 | `@eristack/approval-inbox` | idea | Pending approvals list | |
| U18 | `@eristack/dashboard-kit` | idea | Widget grid layout | |
| U19 | `@eristack/chart-kit` | idea | Bar/line chart wrappers | |
| U20 | `@eristack/map-pin` | idea | Map + geo pins | |
| U21 | `@eristack/barcode-scanner` | idea | Camera barcode hook | |
| U22 | `@eristack/signature-capture` | idea | Canvas signature | |
| U23 | `@eristack/money-input` | idea | Currency input field | money |
| U24 | `@eristack/qty-input` | idea | Qty + uom picker | uom |
| U25 | `@eristack/wall-date-picker` | idea | Wall date range UI | timestamp |
| U26 | `@eristack/filter-builder` | idea | Visual data-grid filters | |
| U27 | `@eristack/saved-view` | idea | Saved list views | |
| U28 | `@eristack/column-manager` | idea | Show/hide/reorder columns | |
| U29 | `@eristack/density-modes` | idea | Compact/comfortable density | design-system |
| U30 | `@eristack/i18n-shell` | idea | RTL + locale switch | |

---

## 06 · AI (16)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| A01 | `@eristack/ai-knowledge` | shipped | recommend(), recipes, catalog | |
| A02 | `@eristack/ai-workflow` | shipped | Local MCP, sprint memory | |
| A03 | `@eristack/ai-ticket-generator` | shipped | Bug/suggestion tickets | |
| A04 | `@eristack/ai-dev` | shipped | Unified check/plan/sync | |
| A05 | `@eristack/ai-domain-procurement` | idea | Intent pack for P2P | |
| A06 | `@eristack/ai-domain-finance` | idea | Intent pack for GL/close | |
| A07 | `@eristack/ai-domain-inventory` | idea | Intent pack for stock | |
| A08 | `@eristack/ai-domain-reporting` | idea | Intent pack for reports | |
| A09 | `@eristack/ai-opinion-author` | idea | Scaffold opinion routes | |
| A10 | `@eristack/ai-schema-draft` | idea | Drizzle schema from spec | |
| A11 | `@eristack/ai-migration-notes` | idea | Upgrade diff writer | |
| A12 | `@eristack/ai-recipe-author` | idea | recipes.yaml assistant | |
| A13 | `@eristack/ai-changeset-assist` | idea | Changeset file generator | |
| A14 | `@eristack/ai-test-scaffold` | idea | vitest wiring generator | |
| A15 | `@eristack/ai-doc-promote` | idea | _ai-docs → package docs | |
| A16 | `@eristack/ai-pr-summary` | idea | PR description from plan JSON | ai-dev |

---

## Totals

| Layer | Count |
| --- | ---: |
| Primitive | 35 |
| Capability | 60 |
| Service | 38 |
| Infrastructure | 14 |
| UI | 30 |
| AI | 16 |
| **Total rows** | **193** |

(shipped/scaffold rows included for map completeness; **~150** are net-new `idea`/`sketch` names)

---

## Quick adds (parked — #214+)

Drop here during brainstorm; promote to table proper when stable.

| Package | Layer | One-liner |
| --- | --- | --- |
| `@eristack/hospitality-rate` | Capability | Room/occupancy pricing |
| `@eristack/fleet` | Capability | Vehicle + fuel log |
| `@eristack/appointment` | Capability | Service appointment slots |
| `@eristack/loyalty` | Capability | Points ledger |
| `@eristack/survey` | Capability | CSAT forms (not CRM) |
| `@eristack/kiosk` | UI | Touch-first shell |
| `@eristack/offline-sync` | Service | IndexedDB sync protocol |
| `@eristack/multi-currency-close` | Capability | Revaluation at period end |
