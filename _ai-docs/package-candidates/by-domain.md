# Package candidates — by domain

Same names as [catalog.md](./catalog.md), grouped for product brainstorming. **Not priority order.**

## Finance & accounting

| Package | Layer |
| --- | --- |
| `@eristack/coa`, `fiscal-calendar`, `accounting` | P / C |
| `@eristack/financial-ledger` | C (shipped) |
| `@eristack/budget`, `cost-center`, `profit-center` | C |
| `@eristack/bank-reconciliation`, `cash-application`, `dunning` | C |
| `@eristack/intercompany`, `transfer-pricing` | C |
| `@eristack/depreciation`, `asset-register`, `lease` | C |
| `@eristack/feature-finance`, `feature-ap`, `feature-ar`, `feature-assets` | F |
| `@eristack/reporting`, `reporting-dsl` | C |
| `@eristack/ai-domain-finance` | A |

## Procurement & payables

| Package | Layer |
| --- | --- |
| `@eristack/partner`, `payment-terms`, `three-way-match` | C |
| `@eristack/landed-cost`, `customs`, `blanket-order` | C |
| `@eristack/feature-procurement`, `feature-ap` | F |
| `@eristack/ai-domain-procurement` | A |

## Sales & receivables

| Package | Layer |
| --- | --- |
| `@eristack/pricelist`, `discount-scheme`, `rebate`, `commission` | C |
| `@eristack/credit-limit`, `contract`, `recurring-billing` | C |
| `@eristack/consignment`, `substitution` | C |
| `@eristack/feature-sales`, `feature-ar`, `feature-pricing`, `feature-subscription` | F |

## Inventory & warehouse

| Package | Layer |
| --- | --- |
| `@eristack/stock-movement`, `valuations` | C (shipped) |
| `@eristack/uom`, `quantity`, `serial-number`, `lot-number` | P |
| `@eristack/warehouse`, `serial-batch`, `cycle-count`, `replenishment` | C |
| `@eristack/pick-pack-ship`, `carrier`, `freight-rate` | C |
| `@eristack/feature-inventory`, `feature-warehouse` | F |
| `@eristack/ai-domain-inventory` | A |

## Manufacturing

| Package | Layer |
| --- | --- |
| `@eristack/bom`, `kitting`, `mrp`, `shop-floor`, `engineering-change` | C |
| `@eristack/feature-manufacturing` | F |

## Quality & returns

| Package | Layer |
| --- | --- |
| `@eristack/quality-inspection`, `non-conformance`, `return-authorization`, `warranty` | C |
| `@eristack/feature-quality` | F |

## Masters & reference data

| Package | Layer |
| --- | --- |
| `@eristack/address`, `contact`, `person-name`, `org-name` | P |
| `@eristack/item`, `sku`, `barcode`, `hs-code` | P / C |
| `@eristack/partner`, `feature-partner`, `feature-product` | C / F |
| `@eristack/enum-pack`, `reason-code`, `document-type` | P |
| `@eristack/import-job`, `export-job` | S |

## Documents & workflow

| Package | Layer |
| --- | --- |
| `@eristack/doc-number`, `doc-transitions`, `pbac` | C / S |
| `@eristack/qups`, `allocation` | C |
| `@eristack/approval-matrix`, `delegation` | C |
| `@eristack/feature-cost-sheet` | F (TS) |
| `@eristack/doc-shell`, `approval-inbox`, `audit-timeline` | U |

## Platform & strict HTTP

| Package | Layer |
| --- | --- |
| `@eristack/opinion`, `rest`, `data-grid`, `epoch` | S / I |
| `@eristack/jwt-auth`, `rbac`, `abac` | S |
| `@eristack/idempotency`, `rate-limit`, `webhook`, `api-key` | S |
| `@eristack/backseat`, `ai-dev` | I (shipped) |
| `@eristack/ai-opinion-author`, `contract-test` | A / I |

## Integration & compliance

| Package | Layer |
| --- | --- |
| `@eristack/edi`, `oauth-bridge`, `scim` | S |
| `@eristack/outbox`, `notification`, `email-template` | S |
| `@eristack/pii-mask`, `retention`, `consent` | S |
| `@eristack/pdf-render`, `print-queue`, `label-zpl` | S |

## UI / UX (proposed layer name)

| Package | Layer |
| --- | --- |
| `@eristack/design-system`, `multitab`, `doc-shell`, `form-kit` | U |
| `@eristack/line-grid`, `money-input`, `qty-input`, `wall-date-picker` | U |
| `@eristack/data-dense-table`, `filter-builder`, `saved-view` | U |
| `@eristack/print-view`, `chart-kit`, `dashboard-kit` | U |

## Agent tooling

| Package | Layer |
| --- | --- |
| `@eristack/ai-knowledge`, `ai-workflow`, `ai-ticket-generator`, `ai-dev` | A (shipped) |
| `@eristack/ai-recipe-author`, `ai-changeset-assist`, `ai-doc-promote` | A |
| `@eristack/ai-schema-draft`, `ai-test-scaffold`, `ai-migration-notes` | A |

## Cross-domain counts

| Domain | ~Packages |
| --- | ---: |
| Finance | 25+ |
| Supply chain | 40+ |
| Masters | 20+ |
| Platform | 30+ |
| UI | 30 |
| AI | 16 |

See [catalog.md](./catalog.md) for authoritative ids (#P01, #C01, …).
