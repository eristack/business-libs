# Improvements — all shipped packages (wave 2 brainstorm)

**Scope:** 20 publishable `@eristack/*` packages today. **Not** layer-06 Features.  
**Effort:** S · M · L · XL · **Horizon** (capability draft, not sprint)

Cross-package items from [audit/improvement-backlog.md](../audit/improvement-backlog.md) stay canonical for A–D sprints; this file adds **per-package** ideas under new rules.

---

## 01 · `@eristack/money`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| M1 | Export `compareDecimalStrings`, `parseDecimalFilter` as stable public API | S | **done** — `@eristack/money` core |
| M2 | `Money.format()` locale intent hook (app supplies formatter) | M | not i18n engine — callback only |
| M3 | FX `Conversion` rate staleness metadata (asOf instant) | S | **done** — `asOf`, `rateAsOfInstant`, `isExchangeRateStale` |
| M5 | `money/adapters` zod 4 refinements for form fields | S | **done** — `createMoneySchema`, `moneyFormValueSchema` |
| M6 | Ledger skill: allocate + split examples with remainder handling | S | **done** — money-ledger skill |
| M7 | Express middleware: reject JSON number money bodies | S | **done** — `rejectJsonNumberMoneyBody` |

---

## 02 · `@eristack/timestamp`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| T1 | Wall `addDays` / inclusive range helpers | M | **done** — `addWallDays`, `isWallInRange` |
| T2 | `compareWallDates`, sort helpers for data-grid wall columns | S | **done** — `sortWallClocks` |
| T3 | Drizzle column helpers: instant vs wall documented in one table | S | **done** — adapters.md subpath map |
| T6 | Nest pipe + Express middleware parse wall query params | S | **done** — `parseWallQueryValue`, `readWallQueryParam` |
| T7 | Property tests DST spring/fall for Asia/Jakarta, America/New_York | M | |

---

## 03 · `@eristack/doc-number`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| D1 | `{SCOPE}` token docs + timezone-aware period reset recipes | S | **done** — format.md + sequencing.md |
| D3 | Format preview API for settings UI (no increment) | S | **done** — `previewDocumentNumber` / REST preview |
| D4 | Scoped sequences: branch/warehouse scope without new package | M | app-owned scope table |
| D5 | OpenAPI fragment generator for format CRUD routes | S | opinion/rest later |
| D6 | Backseat register: format list + preview only seed | S | **done** — `seedDocNumberBackseatFormats` |

---

## 04 · `@eristack/qups`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| Q1 | `applyCellPatch` + spreadsheet commit helpers exported with tests | S | **done** — audit B-017 |
| Q3 | Modifier dependency graph validation (cycle detect) | S | **done** — `assertAcyclicModifierOrder` |
| Q4 | `withQupsFields` IndexedDB/plain-object twin for Backseat | M | horizon-a gap |
| Q5 | Drizzle column bundle generator from QupsProfile | Horizon | |
| Q6 | Nest/React: recalc on blur vs on change policy doc | S | **done** — qups-line skill |
| Q7 | UoM qty field type when `@eristack/uom` exists | Horizon | string qty stays |

---

## 05 · `@eristack/stock-movement`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| S1 | Idempotent append by clientRequestId | M | **done** — `idempotencyKey` on append |
| S2 | Multi-location transfer as two append ops helper | S | **done** — `appendStockTransfer` |
| S3 | Snapshot qty by locationId + optional lotId filters | S | **done** — `snapshotLotBalance`, `snapshotLotsAtLocation` |
| S4 | Integration: concurrent append same chain | M | audit A-011 |
| S5 | `verify` failure messages include entry index + hash prefix | S | **done** |
| S6 | Backseat register stock routes for demos | S | **done** — `registerStockMovementBackseat` |

---

## 06 · `@eristack/financial-ledger`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| F1 | `trialBalance` snapshot helper (account list → Money) | M | **done** — `trialBalance` |
| F2 | Multi-currency same accountId integration test | M | **done** — audit A-010 |
| F3 | Posting templates: debit/credit pair builder | S | **done** — `buildBalancedPostingPair` |
| F5 | Reversal entry helper (swap DR/CR, link entryTypeId) | S | **done** — `buildReversalPost` |
| F6 | Document when **not** to use GL (document-lines ERP) | S | **done** — financial-ledger getting-started |

---

## 07 · `@eristack/valuations`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| V1 | Method picker decision tree in getting-started (DOC-001) | S | **done** — audit DOC-001 |
| V3 | All 9 methods parametric tests | L | **done** — audit A-005 |
| V5 | FEFO requires expiresAt — document + test edge null | S | **done** — methods.adversarial.test.ts |
| V6 | Layer + ledger verify cross-check helper | M | |

---

## 08 · `@eristack/jwt-auth`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| J1 | Supertest E2E: login → refresh → rotate → revoke | M | **done** — audit C-008 |
| J5 | Zod 4 login/register schemas exported | S | **done** — `@eristack/jwt-auth/zod` |
| J6 | `testing` subpath: in-memory credential store re-export | S | **done** — audit D-006 partial |

---

## 09 · `@eristack/rbac`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| R1 | Role hierarchy transitive closure helper | S | **done** — `expandRolePermissions` |
| R2 | Drizzle integration assignRole + can() | S | **done** — audit A-008 |
| R3 | Express `requirePermission` composition examples | S | **done** — rbac-adapters skill |
| R4 | Resource:action naming convention guide | S | **done** — knowledge/rbac-permissions.md |
| R5 | Bulk import roles from YAML (admin tooling) | M | |

---

## 10 · `@eristack/abac`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| A1 | `assignmentPairMatch` cookbook (branch × trade) | S | **done** — abac core test + concepts |
| A2 | attrs helpers typed for common ERP attrs | S | **done** — `branchIdEquals`, `maxBookValueAtMost` |
| A3 | Policy test harness: table-driven evaluate fixtures | M | |
| A4 | Warn when money attrs use number not string | S | **done** — `maxBookValueAtMost` rejects JSON numbers |
| A5 | Nest guard error envelope matches http-errors | S | **done** — 409 `POLICY_DENIED` Nest + Express |

---

## 11 · `@eristack/pbac`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| P1 | `documents.transitions()` more examples (Publication preset) | S | **done** — document-policies.md |
| P2 | Express 409 POLICY_DENIED supertest | S | **done** — audit T-005 |
| P3 | Policy registry export for OpenAPI enum generation | Horizon | opinion |
| P4 | Transition table validator (from/to/status) | M | |
| P5 | React hook: loading + denied reason string | S | **done** — `useBusinessPolicy` + adapters.md |

---

## 12 · `@eristack/data-grid`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| G1 | `executeDrizzleList` sqlite harness test | M | **done** — audit A-003 |
| G2 | `type: wall` filter ops documented with timestamp | S | **done** — getting-started |
| G3 | `executeBackseatList` parity with drizzle envelope | M | backseat lists |
| G4 | Saved view serialize/deserialize JSON schema | M | UI candidate |
| G5 | Decimal string compare ops export for apps | S | **done** — `@eristack/money` M1 |
| G6 | Cursor pagination stability doc (tie-breaker column) | S | **done** — edge-cases.md |
| G7 | Nest ParseDataGridPipe edge cases test | S | **done** — parse-data-grid-pipe.test.ts |

---

## 13 · `@eristack/epoch`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| E1 | `bumpMany` integration test | S | **done** — audit A-009 |
| E4 | HTTP cache-control header helper optional | S | **done** — `epochCacheControlHeader` |
| E5 | Epoch mismatch metrics hook for logger | Horizon | |

---

## 14 · `@eristack/hash-chained-ledger`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| H1 | `@eristack/hash-chained-ledger/testing` sqlite setup exported | S | **done** — `./testing` + skill |
| H2 | Tamper helper recipes in skill | S | **done** — hash-chained-ledger-core skill |
| H3 | Batch append transactional semantics doc | S | **done** — hashing.md + skill |
| H4 | Chain export JSON for audit packages | M | audit-event later |
| H5 | Postgres vs sqlite hash parity test | M | |

---

## 15 · `@eristack/backseat`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| B1 | `store.atomic()` multi-collection (done — document patterns) | S | **done** — api-reference.md |
| B2 | `listRoutes()` snapshot for contract tests | S | **done** — audit X-006 |
| B3 | IndexedDB smoke in CI | M | **done** — audit X-005 |
| B4 | Seed pack v1 JSON checked in | M | **done** — audit C-007 |
| B5 | `jsonError` / versionConflict exported helpers (done — skill) | S | **done** — api-reference.md + backseat-core skill |
| B6 | data-grid list executor in-memory | M | ticket |
| B7 | Devtools: route diff export | M | |

---

## 16 · `@eristack/multitab`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| U1 | Dirty close guard + confirm callback contract | M | alpha gate |
| U2 | TanStack Router sync recipe (full file) | S | **done** — router-recipe.md |
| U3 | MRU tab activation tests (done — keep coverage) | S | |
| U4 | Tab title async update hook | S | **done** — `useTabTitle` |
| U5 | Keyboard shortcuts headless map | M | |
| U6 | Persist tab strip to sessionStorage optional | S | **done** — session-storage helpers |

---

## 17 · `@eristack/ai-knowledge`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| K1 | `loadPlan()` + canonicalSkills (shipped — extend to more recipes) | S | |
| K2 | Recipe for each new capability in wave2 when promoted | S | ongoing |
| K3 | `compose-spine` vs `document-lines-erp` disambiguation tests | S | **done** — recommend.test.ts |
| K4 | Catalog compact table in skill (shipped — maintain) | S | |
| K5 | knowledge ↔ docs mirror CI (audit B-016) | M | **done** |
| K6 | Horizon link from recommend for infra packages | S | **done** — recipes.yaml horizon refs |

---

## 18 · `@eristack/ai-workflow`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| W1 | MCP tool inventory doc sync with code | S | **done** — mcp.md |
| W2 | Sprint template `.eristack/workflow` for package work | S | **done** — workflow.md |
| W3 | Vector index optional disable for CI | S | **done** — search.md `--no-embed` |
| W4 | Chunk size tuning guide | S | **done** — search.md limits table |
| W5 | Cross-link ai-dev plan JSON | S | **done** — getting-started.md |

---

## 19 · `@eristack/ai-ticket-generator`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| TK1 | getting-started.md (audit D-009) | S | **done** |
| TK2 | Feasibility rubric examples per layer | S | **done** — getting-started.md |
| TK3 | Auto-suggest package from stack trace path | M | |
| TK4 | Private package skip (shipped) — document | S | **done** — getting-started.md |

---

## 20 · `@eristack/ai-dev`

| # | Improvement | Effort | Notes |
| ---: | --- | --- | --- |
| AD1 | `--profile integration` (audit A-014) | S | **done** |
| AD2 | `eristack plan` suggests next audit backlog id | M | **done** — `nextBrainstormItem` on DevPlan |
| AD3 | MCP tools: knowledge:check wrapper | S | **done** — `dev_knowledge_check` |
| AD4 | runChecks unit tests (audit T-001) | M | **done** |
| AD5 | Changeset body length warn | S | **done** — audit D-010 |
| AD6 | `check --profile features` = verify layer-06 empty | S | **done** |

---

## Cross-package (wave 2 themes)

| Theme | Packages | Effort |
| --- | --- | --- |
| **Opinion HTTP** | data-grid, pbac, jwt-auth, epoch → `@eristack/opinion` | XL |
| **Logger context** | all adapters → `@eristack/logger` | L |
| **Testing subpaths** | all with memory stores | L | audit D-006 |
| **Zod 4 parity** | money, timestamp, doc-number, data-grid, epoch | M |
| **Backseat register collapse** | 9 registers → helpers | M | audit X-002 |
| **Horizon A → B parity** | backseat, qups, epoch, jwt-auth | M | examples |

**Total improvement rows (this file):** ~120 · **Shipped package sections:** 20/20
