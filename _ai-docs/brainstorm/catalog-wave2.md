# Package candidates — catalog wave 2 (#214+)

**60 new rows** · brainstorm only · post–Features-layer rules ([brainstorm-rules.md](./brainstorm-rules.md))  
**No `@eristack/feature-*`** — horizontal spine, capabilities, infra, UI, AI.

Promote to [horizon.md](../../roadmap/horizon.md) only after human review.

---

## 01 · Primitive (#214–#228)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 214 | `@eristack/quantity` | idea | String decimal qty distinct from money | pairs uom, qups |
| 215 | `@eristack/ratio` | idea | Pure ratio strings (e.g. "0.125") | tax, allocation |
| 216 | `@eristack/entity-id` | sketch | UUID v7 generate/parse, Drizzle column | horizon observing |
| 217 | `@eristack/uom` | sketch | Units + fixed conversion ratios | horizon |
| 218 | `@eristack/percent` | idea | Basis points / percent strings | qups modifiers |
| 219 | `@eristack/address` | sketch | Normalized postal lines | horizon |
| 220 | `@eristack/contact` | sketch | Person/channel on a party | horizon |
| 221 | `@eristack/coa` | sketch | Chart of accounts tree types | horizon |
| 222 | `@eristack/fiscal-calendar` | idea | Fiscal year + open/closed periods | horizon |
| 223 | `@eristack/business-calendar` | idea | Working days + holiday set refs | not full HR |
| 224 | `@eristack/etag` | idea | Optimistic lock token parse/format | pairs version field |
| 225 | `@eristack/currency-pair` | idea | Base/quote pair validation | FX tables |
| 226 | `@eristack/interval` | idea | Closed/open instant ranges | reporting |
| 227 | `@eristack/checksum` | idea | CRC/sha256 hex for doc exports | audit |
| 228 | `@eristack/enum-pack` | idea | Registered enum sets + labels | forms /options |

---

## 02 · Capability (#229–#248)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 229 | `@eristack/doc-transitions` | sketch | Preset status graphs for pbac | horizon |
| 230 | `@eristack/partner` | sketch | Partner id + role refs (not CRM) | app owns rows |
| 231 | `@eristack/item-ref` | idea | SKU/item id + category ref helpers | not feature-product |
| 232 | `@eristack/tax` | idea | Tax code + rate resolve by date | branch from qups tax |
| 233 | `@eristack/payment-terms` | idea | Net 30, discount date math | money + wall |
| 234 | `@eristack/allocation` | sketch | Header charge → line splits | money.allocate |
| 235 | `@eristack/landed-cost` | sketch | Freight/duty to receipt lines | valuations |
| 236 | `@eristack/serial-batch` | idea | Lot/serial identity helpers | stock-movement |
| 237 | `@eristack/bom` | sketch | BOM explosion qty strings | manufacturing apps |
| 238 | `@eristack/pricelist` | idea | Effective-dated price rows | qups |
| 239 | `@eristack/credit-limit` | idea | Exposure check pure fn | partner + money |
| 240 | `@eristack/approval-threshold` | idea | Amount tier → required role | abac/rbac glue |
| 241 | `@eristack/intercompany` | idea | IC due-to/due-from pair refs | GL apps |
| 242 | `@eristack/budget-envelope` | idea | Budget vs actual compare | reporting |
| 243 | `@eristack/cost-center` | idea | Cost center code refs | allocations |
| 244 | `@eristack/three-way-match` | idea | PO–GR–invoice tolerance pure fn | app supplies docs |
| 245 | `@eristack/document-ref` | idea | Typed doc family + id + version ref | cross-doc linking |
| 246 | `@eristack/line-discount` | idea | Stackable discount rules on qups | capability not feature |
| 247 | `@eristack/fx-table` | idea | Rate table lookup by date | money Conversion |
| 248 | `@eristack/rounding-policy` | idea | Named rounding profiles for ledger | money Rounding |

---

## 03 · Service (#249–#268)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 249 | `@eristack/opinion` | sketch | REST canon + OpenAPI + tRPC mirror | horizon priority |
| 250 | `@eristack/audit-event` | idea | Domain audit stream types | append-only |
| 251 | `@eristack/outbox` | idea | Outbox row + dispatch contract | integrations |
| 252 | `@eristack/file-ref` | idea | Attachment metadata + signed URL iface | app owns blob |
| 253 | `@eristack/import-job` | idea | CSV/Excel row pipeline types | data-grid |
| 254 | `@eristack/export-job` | idea | Bulk export job status | data-grid |
| 255 | `@eristack/scheduler` | idea | Cron/recurrence as data | app runs worker |
| 256 | `@eristack/idempotency` | idea | Idempotency-Key store contract | REST |
| 257 | `@eristack/correlation` | idea | Request/causation id helpers | logger |
| 258 | `@eristack/tenant-scope` | idea | Company/site scope for abac attrs | multi-company apps |
| 259 | `@eristack/webhook` | idea | Signed inbound webhook verify | HMAC |
| 260 | `@eristack/notification` | idea | Multi-channel notify dispatch iface | email/sms app |
| 261 | `@eristack/read-model` | idea | Projector cursor + checkpoint | CQRS-lite |
| 262 | `@eristack/dead-letter` | idea | Failed job replay metadata | outbox |
| 263 | `@eristack/health` | idea | Health/readiness aggregator | k8s |
| 264 | `@eristack/metrics` | idea | Counter/histogram registry iface | prometheus |
| 265 | `@eristack/feature-flag` | idea | Flag evaluation service | not LaunchDarkly clone |
| 266 | `@eristack/pii-mask` | idea | Redact logs/responses | logger |
| 267 | `@eristack/saga` | idea | Compensating step registry | long workflows |
| 268 | `@eristack/label-zpl` | idea | ZPL payload builder | warehouse apps |

---

## 04 · Infrastructure (#269–#278)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 269 | `@eristack/logger` | idea | JSON lines + request context | priorities #3 |
| 270 | `@eristack/rest` | idea | Mount opinion routes Express/Nest | priorities #4 |
| 271 | `@eristack/seed-pack` | idea | Versioned demo seed bundles | backseat |
| 272 | `@eristack/fixture-loader` | idea | JSON fixture loader for tests | internal + consumers |
| 273 | `@eristack/contract-test` | idea | OpenAPI contract test harness | opinion |
| 274 | `@eristack/blob-ref` | idea | S3/R2 signed URL helpers | file-ref impl |
| 275 | `@eristack/queue-ref` | idea | Queue send/receive iface | SQS/Rabbit |
| 276 | `@eristack/migration-runner` | idea | Drizzle migrate wrapper CLI | ai-dev sibling |
| 277 | `@eristack/drizzle-kit-helpers` | idea | Shared drizzle config snippets | monorepo |
| 278 | `@eristack/vercel-adapters` | idea | Serverless handler helpers | deploy |

---

## 05 · UI (#279–#293)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 279 | `@eristack/design-system` | sketch | Canon tokens + shadcn recipes | horizon |
| 280 | `@eristack/doc-shell` | idea | Doc header, status, actions | horizon |
| 281 | `@eristack/form-kit` | idea | TanStack Form + /options wiring | opinion |
| 282 | `@eristack/data-dense-table` | idea | data-grid + table UX | horizon |
| 283 | `@eristack/command-palette` | idea | Jump/nav palette | horizon |
| 284 | `@eristack/print-view` | idea | Print CSS + report preview | reporting-dsl |
| 285 | `@eristack/line-grid` | idea | Spreadsheet line editor | qups |
| 286 | `@eristack/money-input` | idea | Currency input headless | money |
| 287 | `@eristack/qty-input` | idea | Qty + uom picker | uom |
| 288 | `@eristack/wall-date-picker` | idea | Wall date range UI | timestamp |
| 289 | `@eristack/filter-builder` | idea | Visual data-grid filters | data-grid |
| 290 | `@eristack/saved-view` | idea | Saved list views UI | data-grid |
| 291 | `@eristack/audit-timeline` | idea | Who/when/status timeline | audit-event |
| 292 | `@eristack/attachment-panel` | idea | File list + upload shell | file-ref |
| 293 | `@eristack/density-modes` | idea | Compact/comfortable density | design-system |

---

## 06 · AI (#294–#303)

| # | Package | Status | One-liner | Notes |
| ---: | --- | --- | --- | --- |
| 294 | `@eristack/ai-domain-document-lines` | idea | Intent pack for header+lines apps | not feature layer |
| 295 | `@eristack/ai-opinion-author` | idea | Scaffold opinion routes from spec | opinion |
| 296 | `@eristack/ai-schema-draft` | idea | Drizzle schema from markdown spec | ai-dev |
| 297 | `@eristack/ai-migration-notes` | idea | Upgrade diff writer | upgrading.md |
| 298 | `@eristack/ai-recipe-author` | idea | recipes.yaml assistant | ai-knowledge |
| 299 | `@eristack/ai-test-scaffold` | idea | vitest + drizzle harness generator | test-harness |
| 300 | `@eristack/ai-doc-promote` | idea | _ai-docs → package docs promoter | ai-working-docs |
| 301 | `@eristack/ai-changeset-assist` | idea | Changeset file generator | ai-dev |
| 302 | `@eristack/ai-pr-summary` | idea | PR body from plan JSON | ai-dev |
| 303 | `@eristack/ai-contrast-audit` | idea | Site contrast + layer token checker | web CI |

---

## Layer 06 · Features — intentionally empty

No new `@eristack/feature-*` rows in wave 2. Vertical modules stay in [roadmap/features.md](../../roadmap/features.md) as **distant scaffolding only**.

---

## Suggested horizon promotions (human pick ≤5)

| # | Package | Why soon |
| ---: | --- | --- |
| 249 | `@eristack/opinion` | Unblocks rest + doc-shell + form-kit |
| 269 | `@eristack/logger` | Already priorities #3 |
| 229 | `@eristack/doc-transitions` | Reduces pbac copy-paste |
| 217 | `@eristack/uom` | Qups + apps ask for qty conversion |
| 271 | `@eristack/seed-pack` | Backseat M3 demos |

---

## Totals (catalog + wave 2)

| Source | Net-new ideas |
| --- | ---: |
| [catalog.md](./catalog.md) | ~150 |
| **catalog-wave2.md** | **90** (#214–#303) |
| **Combined** | **~240** brainstorm names |

(shipped/scaffold rows in catalog.md unchanged)

---

## Quick adds merged (#304+)

| # | Package | Layer | One-liner |
| ---: | --- | --- | --- |
| 304 | `@eristack/hospitality-rate` | Capability | Room/occupancy pricing |
| 305 | `@eristack/fleet` | Capability | Vehicle + fuel log refs |
| 306 | `@eristack/appointment` | Capability | Service appointment slots |
| 307 | `@eristack/loyalty` | Capability | Points ledger on HCL |
| 308 | `@eristack/survey` | Capability | CSAT forms (not CRM) |
| 309 | `@eristack/kiosk` | UI | Touch-first shell |
| 310 | `@eristack/offline-sync` | Service | IndexedDB sync protocol |
| 311 | `@eristack/multi-currency-close` | Capability | Revaluation at period end |
| 312 | `@eristack/reporting` | Capability | Report query + job runner | horizon sketch |
| 313 | `@eristack/reporting-dsl` | Capability | Band/group layout DSL | horizon |
| 314 | `@eristack/accounting` | Capability | Posting rules + period | horizon |
| 315 | `@eristack/geo` | Primitive | Lat/lng + tz default | horizon |
| 316 | `@eristack/phone` | Primitive | E.164 parse/format | |
| 317 | `@eristack/iban` | Primitive | IBAN validate | |
| 318 | `@eristack/barcode` | Primitive | EAN/UPC parse | |
| 319 | `@eristack/incoterms` | Primitive | EXW/FOB enum | |
| 320 | `@eristack/hs-code` | Primitive | Tariff code string rules | |

**Wave 2 file total:** 107 rows (#214–#320)
