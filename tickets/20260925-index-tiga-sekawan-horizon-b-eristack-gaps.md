# Index: Tiga Sekawan Horizon B → @eristack suggestion batch (2026-09-25)

> Cover letter for maintainers. This file is **not** a single-package ticket. Each row below is a portable `eristack-ticket suggest` file you can send independently. Feasibility on child tickets is a first-pass gate — do not treat this index as an implementation brief.

## Meta

- **id:** `20260925-index-tiga-sekawan-horizon-b-eristack-gaps`
- **kind:** suggestion-batch-index
- **reporter:** Tiga Sekawan ERP (consumer)
- **created:** 2026-09-25
- **source of product truth:** `IMPLEMENTATION.md` (§4b Backseat-first, §4d Horizon B delta), [backend-mirror-complete.md](../knowledge/backend-mirror-complete.md)
- **sprint:** `2026-09-25-derive-backend-ports-drizzle-express` (mirror complete)
- **prior batch:** [20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md](./20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md) (19/19 shipped on npm as of 2026-08-27 audit)
- **narrative doc (non-ticket):** [eristack-recommendations-horizon-b-consumer-2026-09-25.md](../knowledge/eristack-recommendations-horizon-b-consumer-2026-09-25.md)

---

## Why this batch exists

Horizon B **workshop mirror** is delivered on Tiga Sekawan: Express proxies to the same Backseat routes, persistence uses Drizzle `backseat_documents` plus SQL `job_register_rows` / `invoice_register_rows` for `executeDrizzleList`. Domain use cases for jobs/invoices are extracted; smoke scripts (`test:api-mirror`) guard the P0 route inventory.

This batch captures **glue we still implemented in-app** that the next Backseat-then-backend consumer should not copy.

We are **not** asking for `@eristack/feature-job`, `@eristack/feature-invoice`, or GL/stock packages.

---

## Priority stack (maintainer triage)

| Priority | Ticket file | Package | Ask |
| --- | --- | --- | --- |
| P0 | `20260925-201500-suggestion-drizzle-backseat-store-atomic-sqlite-staging-a1b2c3.md` | `@eristack/backseat` | Drizzle `atomic()` for better-sqlite3 (staged flush) |
| P0 | `20260925-201501-suggestion-backseat-workshop-server-bootstrap-without-vite-d4e5f6.md` | `@eristack/backseat` | Headless workshop server boot (no web import) |
| P1 | `20260925-201502-suggestion-dual-target-api-mirror-contract-testing-cli-g7h8i9.md` | `@eristack/backseat` | Route snapshot + mirror smoke recipe/CLI |
| P1 | `20260925-201503-suggestion-assignment-scope-sql-and-prefilter-parity-j0k1l2.md` | `@eristack/abac` (+ data-grid) | SQL scope OR + prefilter parity |
| P1 | `20260925-201508-suggestion-derive-backend-checklist-list-projection-recipe-y5z6a7.md` | `@eristack/ai-knowledge` | Derive-backend checklist + list projection recipe |
| P2 | `20260925-201504-suggestion-drizzle-app-spine-bootstrap-bundle-m3n4o5.md` | `@eristack/ai-knowledge` | Spine table bundle / dialect flip (`needs-decision`) |
| P2 | `20260925-201505-suggestion-document-store-port-aligned-with-backseat-p6q7r8.md` | `@eristack/backseat` | Document store port types for domain |
| P2 | `20260925-201506-suggestion-express-map-domain-error-unified-adapter-s9t0u1.md` | `@eristack/backseat` | `createMapDomainError` for Express |
| P2 | `20260925-201507-suggestion-workshop-transport-client-dual-target-v2w3x4.md` | `@eristack/jwt-auth` or backseat | Workshop fetch client |
| P2 | `20260925-201509-suggestion-recommend-suppress-stock-gl-document-lines-b8c9d0.md` | `@eristack/ai-knowledge` | `recommend()` product profile |

---

## Catalog by package

### `@eristack/backseat`

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260925-201500-suggestion-drizzle-backseat-store-atomic-sqlite-staging-a1b2c3.md` | partial | Drizzle sqlite `atomic()` staging |
| `20260925-201501-suggestion-backseat-workshop-server-bootstrap-without-vite-d4e5f6.md` | partial | Workshop server bootstrap |
| `20260925-201502-suggestion-dual-target-api-mirror-contract-testing-cli-g7h8i9.md` | partial | Mirror contract testing |
| `20260925-201505-suggestion-document-store-port-aligned-with-backseat-p6q7r8.md` | possible | Document store port types |
| `20260925-201506-suggestion-express-map-domain-error-unified-adapter-s9t0u1.md` | possible | Express mapDomainError |

Extends shipped Horizon A tickets: `atomic()` (IDB), `listRoutes()`, `jsonError` — see 2026-08-27 index.

### `@eristack/abac` / `@eristack/data-grid`

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260925-201503-suggestion-assignment-scope-sql-and-prefilter-parity-j0k1l2.md` | possible | Scope SQL + prefilter |

Builds on shipped `executeBackseatList` and `matchesAssignmentPair`.

### `@eristack/ai-knowledge`

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260925-201504-suggestion-drizzle-app-spine-bootstrap-bundle-m3n4o5.md` | needs-decision | Spine drizzle bundle |
| `20260925-201508-suggestion-derive-backend-checklist-list-projection-recipe-y5z6a7.md` | possible | Derive-backend + projection recipe |
| `20260925-201509-suggestion-recommend-suppress-stock-gl-document-lines-b8c9d0.md` | possible | recommend() product profile |

### `@eristack/jwt-auth` (client pattern)

| File | Feasibility | Ask |
| --- | --- | --- |
| `20260925-201507-suggestion-workshop-transport-client-dual-target-v2w3x4.md` | partial | Workshop transport client |

---

## What we are **not** asking for

- `@eristack/feature-job` / `@eristack/feature-invoice` / `@eristack/feature-cost-sheet`
- `@eristack/concurrency` as a required package
- Production IndexedDB or `createMemory*Store`
- Partner vertical package (app-owned per `document-lines-erp`)

---

## Consumer evidence paths (Tiga Sekawan)

| Path | Topic |
| --- | --- |
| `packages/db/src/backseat-document-store.ts` | Staged atomic flush |
| `packages/db/src/indexes/rebuild-job-register-index.ts` | SQL list projection |
| `packages/db/src/indexes/rebuild-invoice-register-index.ts` | Invoice grid index |
| `packages/db/src/filters/assignment-scope-where.ts` | Scope SQL (candidate upstream) |
| `apps/api/src/http/workshop-proxy.ts` | Express mirror |
| `scripts/express-api-mirror.mjs` | P0 route smoke |

---

## How to send

Attach individual `.md` files from `.eristack/tickets/` or paste into Eristack issue tracker. Regenerate new tickets with:

```bash
pnpm exec eristack-ticket suggest
```

Do **not** send the narrative [recommendations doc](../knowledge/eristack-recommendations-horizon-b-consumer-2026-09-25.md) alone — use this index + child ticket files.
