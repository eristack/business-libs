# Platform roadmap — existing package upgrades

> Per-package feature expansion and quality bars. Plan only — no implementation order (see [execution-waves.md](./execution-waves.md)).

---

## Upgrade taxonomy

| Class | Description |
| --- | --- |
| **Q** | Quality — tests, docs, exports:check |
| **A** | Adapters — new subpaths |
| **F** | Features — core API expansion |
| **R** | Recipes/skills — agent discoverability |

---

## Primitive layer

### `@eristack/money`

| ID | Class | Upgrade | Rationale |
| --- | --- | --- | --- |
| M-F1 | F | `Money.format(locale, options)` helper exporting ICU-safe patterns | Apps duplicate Intl logic |
| M-F2 | F | `allocateByWeights(items, weights)` beyond equal split | Invoice line splits |
| M-F3 | F | `RoundingPolicy` registry export for app-wide default | Consumers copy string lists |
| M-F4 | F | Banker's rounding mode explicit in docs + tests | ERP audit requirements |
| M-A1 | A | `./prisma` column types (optional peer) | Prisma shops want first-party |
| M-Q1 | Q | Adapter integration test matrix (drizzle round-trip Postgres) | CI gap |
| M-R1 | R | Recipe: "format currency for display", "split payment" | Product language |

### `@eristack/timestamp`

| ID | Class | Upgrade | Rationale |
| --- | --- | --- | --- |
| T-F1 | F | `businessDayAdd(wall, days, calendar)` hook interface | Fiscal calendars delegate here |
| T-F2 | F | `compareInstants`, `isBeforePostingCutoff` exports | Posting date rules |
| T-F3 | F | SQL migration helpers: instant vs timestamptz docs | Drizzle dialect confusion |
| T-Q1 | Q | DST transition test suite (US/EU zones) | Reliability |
| T-R1 | R | Recipe triggers: timezone, UTC, IANA, due date | Discovery |

---

## Capability layer

### `@eristack/doc-number`

| ID | Class | Upgrade |
| --- | --- | --- |
| DN-A1 | A | `./zod` schemas for format CRUD + preview |
| DN-F1 | F | `reserveNext()` for optimistic UI before commit |
| DN-F2 | F | Multi-sequence per format (line vs header) |
| DN-F3 | F | `parseDocumentNumber` error types export for forms |
| DN-Q1 | Q | Per-adapter doc pages in `_meta.json` |
| DN-R1 | R | Recipe: "document series per warehouse" |

### `@eristack/qups`

| ID | Class | Upgrade |
| --- | --- | --- |
| Q-F1 | F | `withQupsColumns` presets for common ERP line shapes |
| Q-F2 | F | Header/footer discount allocation across lines |
| Q-F3 | F | Landed cost surcharge line type |
| Q-F4 | F | `createQupsFormBridge(tanstackForm)` optional helper |
| Q-A1 | A | **Decision:** express/nest/react OR official headless-only tier |
| Q-A2 | A | `./zod` for line patch payloads |
| Q-Q1 | Q | 10+ integration tests (each truth mode × tax × modifier) |
| Q-R1 | R | Recipe: "recalculate invoice line on blur" |

### `@eristack/stock-movement`

| ID | Class | Upgrade |
| --- | --- | --- |
| SM-F1 | F | `transfer(from, to, qty)` composite posting |
| SM-F2 | F | `reserve` / `unreserve` for SO allocation |
| SM-F3 | F | Idempotency key on append (dedupe retries) |
| SM-F4 | F | Batch append API for GR lines |
| SM-Q1 | Q | Docs → jwt-auth depth (adapters hub, Drizzle walkthrough) |
| SM-Q2 | Q | 15+ tests: verify failure, chain break, concurrent append |
| SM-R1 | R | Standalone recipe: "warehouse quantity on hand" |

### `@eristack/financial-ledger`

| ID | Class | Upgrade |
| --- | --- | --- |
| FL-F1 | F | `trialBalance(asOf)` snapshot helper |
| FL-F2 | F | `reverseEntry(id)` append pattern |
| FL-F3 | F | Multi-book support (bookId dimension) |
| FL-F4 | F | Standard `AccountType` enum export (asset, liability, …) |
| FL-Q1 | Q | Full getting-started with chart-of-accounts inject |
| FL-Q2 | Q | Integration tests with money rounding boundaries |
| FL-R1 | R | Recipe: "post journal entry", "GL balance" |

### `@eristack/valuations`

| ID | Class | Upgrade |
| --- | --- | --- |
| V-F1 | F | `cogsForIssue(qty, method)` for sales invoice |
| V-F2 | F | `revalueLayers(asOf, standardCost)` |
| V-F3 | F | Layer snapshot export for audit PDFs |
| V-Q1 | Q | Method comparison test fixtures (FIFO vs LIFO same data) |
| V-Q2 | Q | Docs: when to use each method (ERP guide) |
| V-R1 | R | Recipe: "inventory valuation report", "COGS on ship" |

### `@eristack/hash-chained-ledger`

| ID | Class | Upgrade |
| --- | --- | --- |
| HCL-F1 | F | `exportChain(from, to)` for audit bundle |
| HCL-F2 | F | Pluggable hash algorithm (default SHA-256) |
| HCL-Q1 | Q | Canonical guide: "building on hash-chained-ledger" |
| HCL-R1 | R | Primary recipe: audit trail, tamper detection |

---

## Service layer

### `@eristack/jwt-auth`

| ID | Class | Upgrade |
| --- | --- | --- |
| JA-A1 | A | `./zod` login/refresh/session |
| JA-A2 | A | `./prisma` RefreshTokenStore + CredentialStore |
| JA-A3 | A | `./hono` router mount |
| JA-F1 | F | `registerPasskey()` extension point (stub) |
| JA-F2 | F | Session device metadata on refresh tokens |
| JA-F3 | F | Rate limit hooks on login |
| JA-Q1 | Q | Postgres integration test (not just SQLite) |
| JA-R1 | R | Recipe: "logout all devices", "session list" |

### `@eristack/data-grid`

| ID | Class | Upgrade |
| --- | --- | --- |
| DG-A1 | A | `./zod` for search param parse |
| DG-A2 | A | `./hono` list action |
| DG-F1 | F | Saved views / column presets export |
| DG-F2 | F | Export CSV from same query (server-side) |
| DG-F3 | F | Money/decimal column op registry (extend today) |
| DG-Q1 | Q | NestJS example orders list |
| DG-R1 | R | Recipe: "export list to CSV", "saved filter" |

### `@eristack/epoch`

| ID | Class | Upgrade |
| --- | --- | --- |
| E-A1 | A | `./zod` bump/policy payloads |
| E-F1 | F | Scope hierarchy (tenant → module → entity) |
| E-F2 | F | `useEpochCachePolicy` SSR notes for TanStack Start |
| E-Q1 | Q | Example: epoch + Query invalidation live demo |
| E-R1 | R | Recipe: "cache invalidation on write" |

### `@eristack/rbac`

| ID | Class | Upgrade |
| --- | --- | --- |
| RB-A1 | A | `./rest` + `./client` for admin CRUD (optional) |
| RB-A2 | A | `./zod` role/permission shapes |
| RB-F1 | F | Role inheritance (child roles) |
| RB-F2 | F | Permission bundles / role templates export |
| RB-Q1 | Q | Multi-tenant role namespace pattern in docs |
| RB-R1 | R | Recipe: "warehouse clerk role", "admin role" |

### `@eristack/abac`

| ID | Class | Upgrade |
| --- | --- | --- |
| AB-D1 | **Decision** | Stateless policies vs Drizzle policy registry |
| AB-F1 | F | Built-in policy templates (maxOrderValue, ownRecordsOnly) |
| AB-F2 | F | Policy test harness `evaluateFixture(policy, attrs)` |
| AB-Q1 | Q | Delete empty drizzle/ or implement |
| AB-R1 | R | Recipe: "user can only edit own orders" |

### `@eristack/pbac`

| ID | Class | Upgrade |
| --- | --- | --- |
| PB-F1 | F | **`defineDocumentTransitions(docType, graph)`** — killer feature for features layer |
| PB-F2 | F | Transition guards compose with abac attrs |
| PB-F3 | F | Standard statuses export (draft, submitted, approved, posted, void) |
| PB-F4 | F | HTTP 409 body shape registry |
| PB-Q1 | Q | PO/GR/Invoice transition cookbook (markdown + skill) |
| PB-R1 | R | Recipes per document family |

---

## Infrastructure & UI

### `@eristack/backseat`

| ID | Class | Upgrade |
| --- | --- | --- |
| BS-F1 | F | M3 PO→GR seed + actions |
| BS-F2 | F | Export snapshot → Drizzle SQL sketch |
| BS-F3 | F | Align route defs with `@eristack/rest` |
| BS-F4 | F | Multi-tab aware API (epoch scopes) |
| BS-R1 | R | Recipe: "prototype ERP without backend" |

### `@eristack/multitab`

| ID | Class | Upgrade |
| --- | --- | --- |
| MT-F1 | F | `createTabWorkspace` stable API |
| MT-F2 | F | Dirty close guard + confirm dialog hook |
| MT-F3 | F | Pin tab / recently closed |
| MT-F4 | F | `@eristack/doc-shell` layout integration |
| MT-Q1 | Q | Fix doc/version skew |
| MT-R1 | R | Recipe: "ERP document tabs", "workspace" |

---

## AI tooling

### `@eristack/ai-knowledge`

| ID | Class | Upgrade |
| --- | --- | --- |
| AK-F1 | F | `recommend()` confidence + rationale string for UI |
| AK-F2 | F | Recipe authoring CLI validation |
| AK-R1 | R | 15+ new recipes (see new-packages.md) |
| AK-Q1 | Q | Site hub shows recommend for all new phrases |

### `@eristack/ai-workflow`

| ID | Class | Upgrade |
| --- | --- | --- |
| AW-R1 | R | Primary recipe: sprint, backlog, MCP |
| AW-F1 | F | Sprint template generator |
| AW-Q1 | Q | getting-started as first nav page |

### `@eristack/ai-ticket-generator`

| ID | Class | Upgrade |
| --- | --- | --- |
| AT-Q1 | Q | Add getting-started.md |
| AT-F1 | F | Ticket → GitHub issue export format |

---

## Cross-cutting upgrades (all packages)

| ID | Upgrade | Applies to |
| --- | --- | --- |
| X-Q1 | Minimum 5 integration tests per T1/T2 package | capability + service |
| X-Q2 | Adapter hub doc matching money pattern | thin doc packages |
| X-Q3 | `ticket.yaml` + changeset discipline | all |
| X-A1 | `./hono` where `./express` exists | T1 |
| X-A2 | `./zod` where wire crosses boundary | T0, T1 |
| X-R1 | Every package gets primary recipe | all 19 |
| X-E1 | Tier label in package.json description | all |

---

## Posting bus (cross-package **F** — new core pattern)

Not a package initially — a **composed helper** in `@eristack/financial-ledger` or new `@eristack/posting`:

```ts
createPostingBus({
  stock: stockMovement,
  financial: financialLedger,
  valuation: valuationEngine,
  idempotency: outbox | key,
})

bus.post({
  type: "gr-receipt",
  lines: [...],
  idempotencyKey: "gr-123",
})
```

**Owns:** routing, ordering, rollback story  
**Does not own:** document headers (feature layer)

Unblocks feature-procurement without triplicate ledger wiring.

---

## Quality bar definition of done (hardening pass)

For any package marked "hardened":

- [ ] ≥5 integration tests (Drizzle Postgres in CI or Testcontainers)
- [ ] getting-started with copy-paste Express + Drizzle + React path
- [ ] Intent skill actionable without opening other files
- [ ] Primary recipe in `recipes.yaml`
- [ ] `./zod` if T0/T1
- [ ] `pnpm exports:check` green after build
