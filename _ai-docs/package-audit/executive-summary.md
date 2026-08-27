# Executive summary — full package audit

One-page for humans. Detail lives in sibling files.

---

## Overall health (honest)

Eristack is **strong on primitives and document-line math** (money, timestamp, qups, jwt-auth core) and **weak on proving the production path** for ledger + list + Backseat composition. Docs and skills often **over-promise Drizzle-default** while tests stay on memory. Agent routing (`recommend` / `loadPlan`) **under-delivers** on cross-cutting guides that recipes advertise in prose.

**Monorepo grade:** **B−** for library quality, **C+** for integrator/agent experience, **B** for meta-tooling (ai-knowledge, ai-dev, ticket.yaml).

---

## Top 15 improvements (ranked)

| Rank | Theme | Severity | Effort | Primary doc |
| ---: | --- | --- | --- | --- |
| 1 | **One sqlite Drizzle integration test** for `createDrizzleLedgerStore` | critical | M | cross-cutting § ledger |
| 2 | **`executeDrizzleList` integration test** (data-grid) | critical | M | cross-cutting § lists |
| 3 | **Valuations: test all 9 methods** + drizzle layer store | critical | L | per-package § valuations |
| 4 | **Fix `loadPlan()`** to include `@eristack/ai-knowledge` canonical skills from recipes | critical | M | cross-cutting § recommend |
| 5 | **Resolve `workspace:*` in published dependencies** (7 packages) | critical | M | cross-cutting § publish |
| 6 | **Horizon A composite example** (Backseat + qups + wall grid + epoch) | critical | L | cross-cutting § examples |
| 7 | **Move `createMemory*` off main exports** → `@eristack/*/testing` | high | L | per-package (many) |
| 8 | **Unify Backseat `register.ts`** (9× `normalizeBasePath`, 2 styles) | high | M | cross-cutting § backseat |
| 9 | **jwt-auth / doc-number skills: 12 sources → 1 canonical** | high | M | docs-and-agents § skills |
| 10 | **Recipe triggers** for shipped APIs (applyCellPatch, atomic, wall list) | high | S | docs-and-agents § recipes |
| 11 | **AGENTS.md intent block** — add 6 missing skills | high | S | docs-and-agents |
| 12 | **Examples in CI** smoke build | high | S | cross-cutting § CI |
| 13 | **Peer deps** for jwt-auth→data-grid, data-grid→timestamp, doc-number peers | high | M | cross-cutting § publish |
| 14 | **409 canon** (version vs policy vs stale epoch) + one handler demo | medium | M | cross-cutting § pbac |
| 15 | **Trim `recommend-eristack` skill** — remove 269-line catalog embed | medium | S | docs-and-agents |

**Effort:** S = hours · M = days · L = multi-day epic

---

## Package scorecard (letter grades)

| Package | Grade | One-line why |
| --- | --- | --- |
| `@eristack/money` | **A−** | Best-tested primitive; express/nest untested; 23 doc files |
| `@eristack/timestamp` | **A−** | Strong DST/wall tests; doc count high |
| `@eristack/qups` | **B+** | Core excellent; drizzle stores partial; memory on export |
| `@eristack/doc-number` | **B** | Good core tests; drizzle stores untested; memory on export |
| `@eristack/jwt-auth` | **B+** | Best adapter test coverage; express/nest/react E2E thin |
| `@eristack/data-grid` | **B−** | Core filters excellent; **zero** drizzle SQL tests |
| `@eristack/pbac` | **B** | Good core; adapter skill stub; no express 409 test |
| `@eristack/abac` | **B+** | Focused; attrs coercion needs doc |
| `@eristack/rbac` | **C+** | Drizzle/guards untested; memory on export |
| `@eristack/epoch` | **C+** | bumpMany shipped; drizzle/rest untested |
| `@eristack/hash-chained-ledger` | **C** | Core tamper tests good; **drizzle store untested** |
| `@eristack/stock-movement` | **C** | Thin tests; re-exports HCL drizzle with no proof |
| `@eristack/financial-ledger` | **C** | 2 test cases; drizzle untested |
| `@eristack/valuations` | **D+** | 7/9 methods **untested**; drizzle untested |
| `@eristack/backseat` | **B** | Good alpha; IndexedDB default untested in CI |
| `@eristack/multitab` | **B+** | Headless solid; React provider smoke missing |
| `@eristack/ai-knowledge` | **A−** | Meta layer strong; loadPlan gap hurts |
| `@eristack/ai-workflow` | **B+** | Good FTS tests |
| `@eristack/ai-ticket-generator` | **B−** | No getting-started.md |
| `@eristack/ai-dev` | **C+** | Useful; 0.0.0; runChecks/MCP untested |

---

## Theme clusters (where to invest a sprint)

### Sprint A — “Prove Drizzle” (reliability target)

Single shared test harness: `internal/test-harness/` that runs:

- HCL `createDrizzleLedgerStore` append/verify/snapshot
- data-grid `executeDrizzleList` with wall + decimal columns
- valuations `createDrizzleLayerStore` FIFO consume
- doc-number format/sequence increment concurrency

**Unlocks:** stock-movement, financial-ledger, valuations, data-grid production claims.

### Sprint B — “Agent routing truth” (cheap tokens target)

- Recipe schema: `canonicalSkills[]` merged in `loadPlan()`
- Trim fat skills (jwt-auth, doc-number, recommend-eristack)
- Recipe triggers for Tiga Sekawan APIs
- Fix web `doc-agent-skills.ts` CTAs

**Unlocks:** agents stop wrong skill loads and 100+ file reads.

### Sprint C — “Show don’t tell” (predictable target)

- `examples/horizon-a/` or extend express: Backseat register + qups lines + wall filter list + epoch bump
- Nest data-grid list sample
- PATCH optimistic version + pbac transition on one resource

**Unlocks:** design target “≤3 files” becomes real for document ERPs.

### Sprint D — “Publish hygiene” (clear boundaries)

- CI: fail if `dependencies` contain `workspace:*` on publishable packages
- Peer map audit script (extends exports:check)
- `@eristack/*/testing` subpath for memory stores

---

## What is *not* broken (stop fixing these)

- Money/timestamp string-first discipline in core paths
- ticket.yaml 20/20 coverage
- docs:check / knowledge:check / changesets:check green
- hash-chained-ledger **core** tamper detection tests
- qups calculateLine/patchLine test depth
- pb `documents.transitions()` shipped and unit-tested
- ai-dev plan/check unification direction (keep iterating)

---

## Relationship to other planning docs

| Doc | Relationship |
| --- | --- |
| `roadmap/horizon.md` | Curated **future** packages — audit is **current** packages |
| `_ai-docs/package-candidates/` | Name brainstorm — audit does not add packages |
| `roadmap/priorities.md` | Unchanged by this audit until human promotes backlog items |

---

## Next step (human)

Pick **one sprint cluster** (A–D). Do not mix all 15 top items in one PR — Changesets and agent docs will drown.

Recommended order: **A → B → C → D** (reliability before docs, examples before publish automation).
