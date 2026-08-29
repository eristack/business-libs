# Improvement backlog — master list

**Format:** `ID` · theme · effort · layer · status · acceptance criteria  
**Effort:** S (<4h) · M (1–3d) · L (3–10d) · XL (>10d)  
**Status:** `open` unless noted

Prioritized clusters match [executive-summary.md](./executive-summary.md) Sprints A–D.

---

## Sprint A — Prove Drizzle (reliability)

| ID | Title | Effort | Layer | Acceptance criteria |
| --- | --- | --- | --- | --- |
| **A-001** | Shared drizzle-sqlite test harness | M | infra | **done** — `@internal/test-harness`; dev-conventions § Drizzle integration tests |
| **A-002** | HCL `createDrizzleLedgerStore` integration test | M | hash-chained-ledger | **done** — `drizzle.integration.test.ts` |
| **A-003** | data-grid `executeDrizzleList` integration test | M | data-grid | **done** — eq, wall between, decimal gte, sort |
| **A-004** | data-grid `buildDrizzleQuery` unit+SQL snapshot | S | data-grid | **done** — `build-drizzle-query.test.ts` (3 combos) |
| **A-005** | valuations all 9 methods parametric tests | L | valuations | **done** — `methods.adversarial.test.ts`; getting-started coverage table updated |
| **A-006** | valuations drizzle layer store test | M | valuations | **done** — `drizzle.integration.test.ts` (FIFO path) |
| **A-007** | doc-number scoped sequence concurrency test | M | doc-number | **done** — parallel `next()` ×10 unique SEQ |
| **A-008** | rbac drizzle store assignRole + can() | S | rbac | **done** — `drizzle.integration.test.ts` |
| **A-009** | epoch drizzle bump + bumpMany | S | epoch | **done** — `drizzle.integration.test.ts` |
| **A-010** | financial-ledger multi-currency post + verify | M | financial-ledger | **done** — `drizzle.integration.test.ts` |
| **A-011** | stock-movement multi-lot append + verify | M | stock-movement | **done** — `drizzle.integration.test.ts` (skipIf no native sqlite) |
| **A-012** | qups drizzle profile store round-trip | S | qups | **done** — `drizzle.integration.test.ts` |
| **A-013** | `pnpm test:integration` root script | S | root | **done** — runs `**/drizzle.integration.test.ts`; wired in `pr` profile + PR `eristack ci` drift |
| **A-014** | ai-dev `--profile integration` | S | ai-dev | **done** — `pnpm eristack check --profile integration`; documented in ai-dev docs + dev-conventions |

---

## Sprint B — Agent routing truth (cheap tokens)

| ID | Title | Effort | Layer | Acceptance criteria |
| --- | --- | --- | --- | --- |
| **B-001** | Recipe schema `canonicalSkills: string[]` | M | ai-knowledge | **done** — recipes.yaml + sync validates |
| **B-002** | `loadPlan()` merges canonicalSkills | M | ai-knowledge | **done** — recommend.test + ERP recipes |
| **B-003** | Trim recommend-eristack catalog embed | S | ai-knowledge | **done** — SKILL.md 94 lines |
| **B-004** | jwt-auth-adapters → 1 source | M | jwt-auth | **done** — wiring-production.md |
| **B-005** | doc-number-adapters → 1 source | M | doc-number | **done** — wiring-production.md |
| **B-006** | money-adapters → 1–2 sources | M | money | **done** — wiring-production.md; core skills trimmed to getting-started |
| **B-007** | data-grid-adapters → ≤3 sources | S | data-grid | **done** — wiring-production.md; core skill trimmed |
| **B-008** | Recipe triggers: applyCellPatch, atomic, wall | S | ai-knowledge | **done** — recipes + recommend.test |
| **B-009** | Recipe triggers: compareDecimalStrings, bumpMany | S | ai-knowledge | **done** — recipes + recommend.test |
| **B-010** | Recipe triggers: documents.transitions, assignmentPairMatch | S | ai-knowledge | **done** — recipes + recommend.test |
| **B-011** | AGENTS.md intent block sync (6 skills) | S | root | **done** — ERP guides, backseat, multitab, logger, rest |
| **B-012** | skills:validate max sources rule | S | root | **done** — fails CI when >3 sources without ticket.yaml override |
| **B-013** | Fill stub adapter skills (rbac,pbac,stock,epoch,fin,val) | M | service/capability | **done** — express/nest snippets in adapter skills |
| **B-014** | hash-chained-ledger-core skill sources block | S | hash-chained-ledger | **done** — sources → getting-started.md |
| **B-015** | Fix recommend.test expected catalog (ai-dev) | S | ai-knowledge | **done** — ai-dev in generated catalog |
| **B-016** | CI mirror hash knowledge ↔ docs | M | ai-knowledge | **done** — check-knowledge-docs-mirror.mjs in sync:check |
| **B-017** | qups-line skill embed applyCellPatch | S | qups | **done** — body documents API without opening docs |
| **B-018** | timestamp-core skill decision tree | S | timestamp | **done** — wall vs instant in skill body |

---

## Sprint C — Show don't tell (predictable)

| ID | Title | Effort | Layer | Acceptance criteria |
| --- | --- | --- | --- | --- |
| **C-001** | `examples/horizon-a` composite app | L | examples | **done** — qups + grid wall + epoch + pbac + jwt + tests |
| **C-002** | README maps to document-lines-erp sections | S | examples | **done** — numbered section parity in README |
| **C-003** | Optimistic version 409 demo in horizon-a | M | examples | **done** — PATCH stale version → 409 in main.ts demo |
| **C-004** | Nest data-grid drizzle list sample | M | examples/nestjs | **done** — `GET /orders` + executeDrizzleList |
| **C-005** | Examples build in CI | S | root | **done** — examples `build` script + `pr` profile runs build |
| **C-006** | eristack check `--profile examples` | S | ai-dev | **done** — `pnpm eristack check --profile examples` |
| **C-007** | backseat seed pack v1 JSON | M | backseat | **done** — `horizon-a-v1.json` + `loadHorizonASeedV1()` |
| **C-008** | jwt-auth express supertest E2E | M | jwt-auth | **done** — express.e2e.test.ts login/refresh/revoke |
| **C-009** | multitab React provider smoke test | S | multitab | **done** — SSR render + missing-provider guard |
| **C-010** | epoch + TanStack Query demo in horizon-a | M | examples | **done** — epoch-cache + epoch-query tests + main demo |

---

## Sprint D — Publish hygiene (clear boundaries)

| ID | Title | Effort | Layer | Acceptance criteria |
| --- | --- | --- | --- | --- |
| **D-001** | Audit workspace:* in dependencies | M | 7 packages | **done** — `workspace:*` only in devDependencies; `pnpm publish:check` green |
| **D-002** | `check-publish-deps.mjs` | S | root | **done** — `pnpm publish:check` in `pr` profile |
| **D-003** | Peer map jwt-auth → data-grid | S | jwt-auth | **done** — peerDependencies + docs |
| **D-004** | Peer map data-grid → timestamp | S | data-grid | **done** — optional peer + peerDependenciesMeta |
| **D-005** | Peer map doc-number → data-grid, timestamp | S | doc-number | **done** — peerDependencies present |
| **D-006** | `@eristack/*/testing` subpath pattern | L | multi | **done** — 13 packages; upgrading.md §2.1 |
| **D-007** | eristack check `--profile publish` | S | ai-dev | **done** — registry + CLI + skill + runner.test |
| **D-008** | ai-dev publish 0.1.0 | S | ai-dev | **open** — human Changesets release (not agent-owned) |
| **D-009** | ai-ticket-generator getting-started.md | S | ai-ticket-generator | **done** — docs + _meta.json |
| **D-010** | changesets max body lines (optional) | S | root | **done** — warn at 80 non-empty lines in check-changesets.mjs |

---

## Cross-cutting — Backseat spine

| ID | Title | Effort | Layer | Acceptance criteria |
| --- | --- | --- | --- | --- |
| **X-001** | `@eristack/backseat` register-helpers | M | backseat | **done** — normalizeBasePath, versionConflict, businessPolicyDenied exported from adapters |
| **X-002** | Refactor 9 package register.ts | M | multi | **done** — thin register.ts + `*-routes.ts`; all spine registers ≤43 lines |
| **X-003** | Unified 409 JSON canon doc | M | ai-knowledge | **done** — http-errors.md + docs mirror + skill |
| **X-004** | pbac backseat errors use jsonError | S | pbac | **done** — BUSINESS_POLICY_DENIED via businessPolicyDenied |
| **X-005** | IndexedDB store smoke test | M | backseat | **done** — fake-indexeddb smoke test |
| **X-006** | listRoutes() coverage test | S | backseat | **done** — horizon-a spine.test.ts ≥12 routes |

---

## Docs-only (no code)

| ID | Title | Effort | Acceptance criteria |
| --- | --- | --- | --- |
| **DOC-001** | valuations method picker table | S | **done** — getting-started.md + test coverage column |
| **DOC-002** | abac attrs vs money warning | S | **done** — abac-core skill |
| **DOC-003** | AGENTS.md no-git wording fix | S | **done** — human commits _meta.json called out |
| **DOC-004** | web doc-agent-skills ERP CTAs | M | **done** — document-lines-erp on qups/backseat/pbac getting-started |
| **DOC-005** | financial-ledger Moneyish boundaries | S | **done** — getting-started § Moneyish boundaries |
| **DOC-006** | ai-workflow vs ai-dev vs ai-knowledge tree | S | **done** — ai-toolbox-decision-tree.md (existing) |

---

## ai-dev / tooling

| ID | Title | Effort | Acceptance criteria |
| --- | --- | --- | --- |
| **T-001** | runChecks unit tests | M | **done** — runner.test.ts profile order |
| **T-002** | MCP dev_plan snapshot test | S | **done** — mcp.test.ts server construct |
| **T-003** | sync command integration test | S | **done** — `packages/ai/ai-dev/tests/sync.test.ts` |
| **T-004** | money express/nest smoke tests | S | **done** — express.smoke.test.ts |
| **T-005** | pbac express 409 test | S | **done** — express.e2e.test.ts + backseat.errors.test.ts |

---

## Horizon / future (do not implement until promoted)

| ID | Title | Notes |
| --- | --- | --- |
| **H-001** | `@eristack/doc-transitions` presets | **shipped 0.1.0** — see packages/capability/doc-transitions |
| **H-002** | `@eristack/opinion` REST canon package | **shipped 0.1.0** (core + express); OpenAPI/Nest horizon |
| **H-003** | `@eristack/test-stores` unified memory | alternative to D-006 per-package testing |
| **H-004** | tRPC adapter layer | horizon note only |

---

## Dependency graph (backlog)

```mermaid
flowchart TD
  A001[A-001 harness] --> A002[A-002 HCL drizzle]
  A001 --> A003[A-003 data-grid drizzle]
  A001 --> A006[A-006 valuations drizzle]
  A002 --> A010[A-010 financial-ledger]
  A002 --> A011[A-011 stock-movement]
  B001[B-001 canonicalSkills schema] --> B002[B-002 loadPlan merge]
  C001[C-001 horizon-a] --> C002[C-002 README map]
  C001 --> C003[C-003 version 409]
  D001[D-001 workspace fix] --> D002[D-002 check script]
  X001[X-001 register-helpers] --> X002[X-002 refactor registers]
```

---

## Status tracking

| Sprint | Open | Done |
| --- | ---: | ---: |
| A | 0 | 14 |
| B | 0 | 18 |
| C | 0 | 10 |
| D | 2 | 8 |
| X | 0 | 6 |
| DOC | 0 | 6 |
| T | 0 | 5 |

**Total open items:** 1 (D-008 human release only — excluding horizon H-003/H-004)

**Brainstorm (`improvements.md`):** all rows shipped or explicitly Horizon-only (Q5, Q7, Nest/OpenAPI opinion adapters). K2 is ongoing maintenance when new packages ship.

When an item ships, mark `done` here with date — optional one-line in package CHANGELOG.

---

## Risk register

| Risk | Mitigation |
| --- | --- |
| D-006 breaks consumer imports | Deprecation re-export from main for one minor 0.x |
| Integration tests flaky on CI | sqlite file temp per test; no shared state |
| Fat skill collapse loses detail | wiring-production.md must be ≥100 lines substantive |
| horizon-a scope creep | Fixed entity set: orders + lines only |
| workspace fix breaks local examples | peerDependenciesMeta optional where needed |
