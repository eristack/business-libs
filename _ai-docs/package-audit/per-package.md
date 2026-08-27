# Per-package audit (all 20 packages)

Paths under `packages/<category>/<name>/`. Grades in [executive-summary.md](./executive-summary.md).

---

## 01 · `@eristack/money` v0.3.1 — Grade **A−**

| Dimension | Assessment |
| --- | --- |
| **Exports** | Core + full mirror: drizzle, rest, zod, express, nest, client, react |
| **Tests** | 3 files: core arithmetic, advanced, adapters (drizzle/zod/client/react). **Gap:** express/nest pipes |
| **Drizzle** | Tested in `tests/adapters.test.ts` |
| **Memory on main** | No — clean |
| **Skills** | 3; `money-adapters` hub → 7 sub-docs (**token risk**) |
| **Docs** | 23 pages — exceeds ≤3-file agent budget for “wire money everywhere” |
| **Design** | Exports validators, naming presets; `formatMoney` uses Number for Intl only — document |

**Improve significantly by:**

1. Collapse adapter docs into one `docs/wiring-production.md` (~120 lines) with subpath index.
2. Add express + nest smoke tests (one route each).
3. Export a one-page `MONEY_INTEGRATION_CHECKLIST` constant array for agents.

---

## 02 · `@eristack/timestamp` v0.1.0 — Grade **A−**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 2 files; excellent DST, gap/overlap, wall helpers |
| **Drizzle** | Tested |
| **Skills** | `timestamp-core` routes to 5 docs after load — **token risk** |
| **Docs** | 18 files; wall/instant split is correct structurally |

**Improve significantly by:**

1. Expand skill body with wall vs instant decision tree (≤40 lines) so agents skip 5 doc opens.
2. Export `WALL_COMPARE_EXPORTS` registry aligned with data-grid `wall` field type.
3. Document `addWallDays` + data-grid filter examples in one canonical block in getting-started.

---

## 03 · `@eristack/doc-number` v0.3.2 — Grade **B**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 5 files; strong format/period; drizzle **table smoke only** |
| **Memory** | `createMemoryFormatStore` / `createMemorySequenceStore` on **main export** — violates target |
| **Peers** | Depends data-grid + timestamp via workspace:*; peers incomplete |
| **Skills** | doc-number-adapters: **9 sources** |
| **Recent** | timezone + scope + {SCOPE} — needs drizzle integration tests for scoped sequences |

**Improve significantly by:**

1. Integration test: concurrent `next()` on scoped sequence with sqlite.
2. Move memory stores to `@eristack/doc-number/testing`.
3. Single `adapters-wiring.md` replacing stores + http split for agents.

---

## 04 · `@eristack/qups` v0.3.1 — Grade **B+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 3 files; calculateLine/patchLine/cell-patch covered |
| **Memory** | Profile + line memory stores on main export |
| **Adapters** | drizzle + backseat only (correct scope) |
| **Skills** | qups-core: 4 sources |

**Improve significantly by:**

1. Document `applyCellPatch` + `withQupsFields` in skill body (not just docs).
2. Drizzle profile store round-trip test.
3. Export `QUPS_FIELD_NAMES` registry for Backseat column binding.

---

## 05 · `@eristack/stock-movement` v0.1.1 — Grade **C**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 1 file — memory ledger only |
| **Drizzle** | Re-exports HCL drizzle; **zero** package tests |
| **Skills** | Adapter skill ~12 lines — stub |

**Improve significantly by:**

1. Depends on shared HCL drizzle test (Sprint A).
2. Multi-lot, multi-owner, verify failure cases.
3. Adapter skill with copy-paste Backseat register block.

---

## 06 · `@eristack/financial-ledger` v0.2.1 — Grade **C**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 2 cases (post + hydrate) |
| **Drizzle** | Untested |
| **Deps** | workspace:* on money + HCL |

**Improve significantly by:**

1. Multi-currency same accountId tests.
2. verify() tamper after drizzle append.
3. Document Moneyish boundaries (string vs Money) in skill.

---

## 07 · `@eristack/valuations` v0.2.1 — Grade **D+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | fifo + movingAverage only; **lifo, fefo, hifo, lofo, weightedAverage, standardCost, specificIdentification untested** |
| **Memory** | `createMemoryLayerStore` via export * |
| **Drizzle** | createDrizzleLayerStore **untested** |

**Improve significantly by:**

1. Parametric test matrix over all `ValuationMethod` values.
2. Layer store + consume chain integration test.
3. Method selection guide in one table (when to use LIFO vs FIFO) in getting-started — agents pick wrong method today.

---

## 08 · `@eristack/data-grid` v0.2.2 — Grade **B−**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Excellent core (filters, cursor, decimal, wall); backseat execute tested |
| **Drizzle** | **Zero** SQL tests for executeDrizzleList / buildDrizzleQuery |
| **Exports** | Good registries: FILTER_OPS, compareDecimalStrings, compareWallValues |
| **Skills** | 6 sources on adapters |

**Improve significantly by:**

1. Sqlite fixture: orders table + wall column + between filter + sort.
2. Document QUERY method future in opinion horizon; stub type in types only.
3. `executeBackseatList` parity test vs drizzle envelope shape (field coverage).

---

## 09 · `@eristack/jwt-auth` v0.4.2 — Grade **B+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | 7 files — best adapter coverage in monorepo |
| **Memory** | Credential + refresh memory stores on main export |
| **Gap** | express router, nest module, react hooks not E2E tested |
| **Deps** | data-grid hard dep; not in peerDependencies |

**Improve significantly by:**

1. One supertest file for login + refresh + revoke.
2. Peer dep `@eristack/data-grid` when using session list schema.
3. `dual-target.md` pattern (docs) for scrypt/Vite — already started; link from skill.

---

## 10 · `@eristack/rbac` v0.2.1 — Grade **C+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Memory store only |
| **Drizzle** | store.ts exists — untested |
| **Skills** | rbac-adapters stub (no code blocks) |

**Improve significantly by:**

1. Drizzle assignRole + can() integration test.
2. express `createRequirePermission` test with mock req.
3. Fill adapter skill with copy-paste from docs/adapters.md.

---

## 11 · `@eristack/abac` v0.2.1 — Grade **B+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Policy + assignmentPairMatch covered |
| **No drizzle** | Correct (stateless) |
| **Gap** | express/nest guards untested |

**Improve significantly by:**

1. assignmentPairMatch recipe trigger (Role × Branch × Trade).
2. Guard integration test.
3. Document attrs numeric coercion vs money (never use as Money).

---

## 12 · `@eristack/pbac` v0.2.1 — Grade **B**

| Dimension | Assessment |
| --- | --- |
| **Tests** | documents.* helpers + transitions() |
| **Gap** | express 409 path untested; backseat inline errors vs jsonError envelope |
| **Skills** | pbac-adapters stub |

**Improve significantly by:**

1. Test `documents.transitions()` with invalid action → throws predictable error.
2. Align backseat register errors with `@eristack/backseat` jsonError shape.
3. Link to future `@eristack/doc-transitions` presets in docs (horizon only).

---

## 13 · `@eristack/epoch` v0.1.0 — Grade **C+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Core bump/compare; bumpMany added |
| **Memory** | createMemoryEpochStore on main export |
| **Drizzle/rest/react** | Untested |

**Improve significantly by:**

1. bumpMany integration with multiple scopes assertion.
2. useEpochCachePolicy test with mock QueryClient.
3. Example: list query keyed by epoch scope (Sprint C).

---

## 14 · `@eristack/hash-chained-ledger` v0.1.1 — Grade **C**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Core tamper + balance equation — good |
| **Drizzle** | **Untested** — blocks 4 downstream packages |
| **Skills** | Missing sources block in core skill |

**Improve significantly by:**

1. **Single sqlite test** — highest leverage in entire monorepo.
2. Add sources → one canonical getting-started in skill.
3. Export test helper `verifyChainInTest()` for consumers.

---

## 15 · `@eristack/backseat` v0.1.2 — Grade **B**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Memory store, router, devtools API |
| **Gap** | IndexedDB store (documented browser default) not in CI |
| **API** | atomic, listRoutes, jsonError, versionConflict — tested lightly |

**Improve significantly by:**

1. IndexedDB test with fake-indexeddb or playwright smoke.
2. Extract shared register helpers for spine packages (see cross-cutting).
3. Seed pack versioning + schema migration story for demos.

---

## 16 · `@eristack/multitab` v0.2.1 — Grade **B+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Headless state/routes/persistence |
| **Gap** | React TanStack provider untested |
| **Docs** | Strong getting-started |

**Improve significantly by:**

1. @testing-library/react smoke for MultitabRouterProvider.
2. Recipe already exists — ensure AGENTS.md lists multitab skill.
3. Document dirty-close + optimistic version interaction.

---

## 17 · `@eristack/ai-knowledge` v0.1.9 — Grade **A−**

| Dimension | Assessment |
| --- | --- |
| **Tests** | recommend + sync-catalog |
| **Gap** | loadPlan omits ai-knowledge skills; recommend.test stale on ai-dev |
| **Skills** | 10 meta skills — good canon |

**Improve significantly by:**

1. Recipe `canonicalSkills` field + loadPlan merge.
2. Auto-trim recommend-eristack catalog block to “run sync” pointer.
3. CI: knowledge/*.md ↔ docs/*.md hash for mirrored guides.

---

## 18 · `@eristack/ai-workflow` v0.1.1 — Grade **B+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | chunk, RRF, search, init — solid |
| **Gap** | MCP tool contracts untested |

**Improve significantly by:**

1. MCP dev_plan-style compact output snapshot tests.
2. Document when to use workflow vs ai-dev vs ai-knowledge (decision tree).

---

## 19 · `@eristack/ai-ticket-generator` v0.1.1 — Grade **B−**

| Dimension | Assessment |
| --- | --- |
| **Tests** | Ticket lifecycle |
| **Gap** | No docs/getting-started.md |

**Improve significantly by:**

1. getting-started.md with eristack-ticket check/subscribe flow.
2. CHANGELOG when publishing next patch.

---

## 20 · `@eristack/ai-dev` v0.0.0 — Grade **C+**

| Dimension | Assessment |
| --- | --- |
| **Tests** | plan.test.ts only |
| **Gap** | runChecks, MCP, sync untested; version 0.0.0 |

**Improve significantly by:**

1. Mock subprocess tests for check registry order.
2. MCP dev_plan snapshot test.
3. Ship 0.1.0 with changeset after Sprint B items stable.

---

## Cross-package memory-store inventory (design-target violation)

These should migrate to `@eristack/*/testing` or `@eristack/test-stores` (horizon brainstorm S??):

| Package | Export |
| --- | --- |
| doc-number | createMemoryFormatStore, createMemorySequenceStore |
| jwt-auth | createMemoryCredentialStore, createMemoryRefreshTokenStore |
| epoch | createMemoryEpochStore |
| rbac | createMemoryRbacStore |
| qups | createMemoryPricingProfileStore, createMemoryPricingLineStore |
| hash-chained-ledger | createMemoryLedgerStore |
| valuations | createMemoryLayerStore (via export *) |
| backseat | createMemoryStore (acceptable for alpha mock) |

**Agent fix today:** skills must say “production: drizzle only; memory imports from testing subpath” once migrated.

---

## Test file counts (reference)

| Package | Test files | Lines (approx) |
| --- | ---: | ---: |
| jwt-auth | 7 | high |
| doc-number | 5 | high |
| money | 3 | medium |
| qups | 3 | medium |
| backseat | 3 | medium |
| multitab | 3 | medium |
| timestamp | 2 | medium |
| data-grid | 2 | high |
| hash-chained-ledger | 2 | medium |
| ai-knowledge | 2 | medium |
| ai-workflow | 4 | medium |
| *all others* | 1 | low |

**Target:** no publishable package with only 1 test file except pure policy packages (abac/pbac) — and even those should gain adapter smoke tests.
