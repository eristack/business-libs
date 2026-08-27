# Docs, skills, recipes, and agent UX audit

Focus: token budget, routing accuracy, mirror drift, AGENTS.md completeness, and web CTAs.

---

## 1. Design target compliance scorecard

| Target | Status | Evidence |
| --- | --- | --- |
| ≤3 files per integrator task | **Fail** for ERP composite | 6+ skills for document ERP |
| One canonical cross-cutting guide | **Pass** | backseat-then-backend, document-lines-erp, upgrading |
| Per-package docs = deltas only | **Partial** | money 23 pages, timestamp 18 |
| Skills actionable without opening files | **Partial** | Many adapter skills are stubs |
| Drizzle default in skills | **Pass** prose | **Fail** if memory still on main export |
| recommend before reinventing | **Pass** | recipes.yaml rich |
| loadPlan delivers recipe promise | **Fail** | canonical skills not merged |

**Agent UX grade: C+** (good canon, poor compression and routing completion)

---

## 2. Skill inventory (all packages)

### Fat skills — sources > 3 (token burn)

| Skill | Sources | Lines (body) | Fix |
| --- | ---: | ---: | --- |
| `@eristack/jwt-auth#jwt-auth-adapters` | **12** | ~80 | One `docs/wiring-production.md` |
| `@eristack/doc-number#doc-number-adapters` | **12** | ~70 | Same |
| `@eristack/ai-knowledge#recommend-eristack` | **1** + **269-line catalog embed** | ~270 | Replace embed with “run knowledge:sync” |
| `@eristack/money#money-adapters` | **7** | ~60 | Collapse to hub + 1 wiring doc |
| `@eristack/data-grid#data-grid-adapters` | **6** | ~55 | Single adapters.md in sources |
| `@eristack/timestamp#timestamp-adapters` | **5** | ~50 | getting-started only |

**Rule proposal:** `pnpm skills:validate` fails if `sources.length > 3` unless package is flagged `allowFatSkills` in ticket.yaml.

### Stub skills — body lacks copy-paste blocks

| Skill | Issue |
| --- | --- |
| rbac-adapters | Points to docs; no express/nest snippet |
| pbac-adapters | Same |
| stock-movement-adapters | ~12 lines |
| epoch-adapters | Thin |
| financial-ledger-adapters | Thin |
| valuations-adapters | Thin |

**Agent behavior today:** Opens docs anyway → defeats skill purpose.

### Missing from AGENTS.md intent block (6 skills)

Compare `pnpm skills:list` vs AGENTS.md `intent-skills` block:

| Skill id | In AGENTS.md? |
| --- | --- |
| `@eristack/multitab#multitab-core` | **No** |
| `@eristack/ai-dev#ai-dev-core` | **No** |
| `@eristack/ai-knowledge#backseat-then-backend` | **No** |
| `@eristack/ai-knowledge#document-lines-erp` | **No** |
| `@eristack/ai-knowledge#optimistic-document-version` | **No** |
| `@eristack/hash-chained-ledger#hash-chained-ledger-adapters` | **No** (adapters skill exists) |

**Fix:** Run docs sync script or extend AGENTS.md generator; **do not hand-edit catalog block** in recommend-eristack.

### ai-knowledge meta skills (good)

| Skill | Quality |
| --- | --- |
| architecture-recommend | A — actionable |
| agent-workflow | A — design targets |
| dev-conventions | A — changesets rules |
| upgrading-eristack | A |
| stack-defaults | B+ |
| ai-toolbox | B+ |

---

## 3. Recipe coverage gaps

### Shipped APIs with weak or missing recipe triggers

| API / concept | Package | Recipe gap |
| --- | --- | --- |
| `applyCellPatch` | qups | Not in triggers |
| `withQupsColumns` / field inject | qups | Partial |
| `store.atomic()` | backseat | Missing |
| `listRoutes()` | backseat | Missing |
| `compareWallValues` / wall filters | data-grid + timestamp | Missing |
| `compareDecimalStrings` | data-grid | Missing |
| `documents.transitions()` | pbac | Weak |
| `assignmentPairMatch` | abac | Missing |
| `bumpMany` | epoch | Missing |
| `createAmountOnlyFieldValidators` | money | Missing |
| `ResetPeriod` + timezone scopes | doc-number | Partial after recent ship |
| `eristack check --profile` | ai-dev | **No recipe yet** (added in prior iteration — verify sync) |

### Recipe rationale vs loadPlan (broken promises)

Examples from `recipes.yaml` audit:

| Recipe id | Rationale mentions | Actually loaded |
| --- | --- | --- |
| document-lines-erp | qups + grid + canonical guide | package skills only |
| backseat-then-backend | Backseat then Express path | backseat package only |
| optimistic-document-version | version + pbac | pbac-core only |

**Fix:** `canonicalSkills` array (see cross-cutting.md).

### recommend() trigger quality

**Strong triggers:** money amounts, jwt login, doc numbers, FIFO stock  
**Weak triggers:** “ERP document”, “mock API”, “wall date filter”, “cell patch recalc”

Add synonym clusters:

```yaml
triggers:
  - cell patch line recalc
  - applyCellPatch
  - spreadsheet cell edit qups
```

---

## 4. Canonical guide mirror drift

### Paired files (knowledge + site docs)

| Canonical | knowledge path | docs mirror | Drift risk |
| --- | --- | --- | --- |
| upgrading | `knowledge/upgrading.md` | `docs/upgrading.md` | Low |
| dev-conventions | `knowledge/dev-conventions.md` | `docs/dev-conventions.md` | Low |
| backseat-then-backend | `knowledge/backseat-then-backend.md` | `docs/backseat-then-backend.md` | **Medium** — ERP sections added to knowledge first |
| document-lines-erp | `knowledge/document-lines-erp.md` | `docs/document-lines-erp.md` | **Medium** |
| optimistic-document-version | `knowledge/optimistic-document-version.md` | `docs/optimistic-document-version.md` | **Medium** |

**Proposal:** CI hash compare for mirrored pairs (ai-dev check item).

### ERP guides content gaps (even in canonical)

| Guide | Missing section |
| --- | --- |
| document-lines-erp | Full PATCH sequence with epoch bump |
| backseat-then-backend | Seed pack version pin |
| optimistic-document-version | Unified 409 JSON example |

---

## 5. Per-package docs token analysis

### Pages count vs unique content

| Package | Doc pages | Unique delta pages (estimate) | Bloat |
| --- | ---: | ---: | --- |
| money | 23 | 8 | Adapter split |
| timestamp | 18 | 7 | instant/wall OK; adapter repeat |
| jwt-auth | 15 | 6 | session/grid overlap |
| data-grid | 14 | 9 | reasonable |
| doc-number | 12 | 5 | format vs stores split |
| qups | 10 | 7 | good |
| ai-knowledge | 12 | 12 | meta — OK |
| backseat | 8 | 6 | good |

### Getting-started completeness

| Package | E2E wiring in getting-started? |
| --- | --- |
| money | Yes |
| timestamp | Yes |
| qups | Yes |
| jwt-auth | Yes |
| data-grid | Yes |
| hash-chained-ledger | Partial — drizzle section thin |
| valuations | Partial — method picker missing |
| stock-movement | Partial |
| ai-ticket-generator | **No getting-started.md** |
| ai-dev | Yes (new) |

---

## 6. AGENTS.md and cursor rules conflicts

| Conflict | Detail |
| --- | --- |
| AGENTS.md vs no-git.mdc | AGENTS says “commit `_meta.json`” — agent taboo |
| AGENTS.md vs ai-knowledge-sync | Correctly aligned on knowledge:sync |
| recommend-eristack size | Violates docs-depth-tokens — catalog should be generated reference only |

**Fix AGENTS.md:** “Human runs docs:sync and commits `_meta.json`” — not agent.

---

## 7. Web app agent CTAs

### `apps/web` doc-agent-skills.ts

Audit finding: some library pages link to **package adapter skill** when **canonical ERP guide** is the correct load for composite tasks.

| Page type | Should CTA |
| --- | --- |
| qups getting-started | qups-line + link document-lines-erp |
| backseat getting-started | backseat + backseat-then-backend |
| pbac adapters | pbac + optimistic-document-version |

---

## 8. ticket.yaml and ai-ticket-generator

| Metric | Value |
| --- | --- |
| Packages with ticket.yaml | 20/20 |
| Generator getting-started | **Missing** |
| Bug vs suggest skills | Present |

**Improve:** ai-ticket getting-started with `eristack-ticket` flow (if CLI exists) or pnpm script.

---

## 9. ai-dev documentation alignment

| ai-dev surface | Documented? | Tested? |
| --- | --- | --- |
| `eristack plan --json` | Yes | plan.test |
| `eristack check --profile pr\|full\|catalog\|fast` | Yes | Partial |
| `eristack sync docs\|knowledge\|all` | Yes | No |
| MCP dev_plan, dev_check | Yes | No |
| `@eristack/ai-dev/repo` | Yes | via consumers |

**Recipe `ai-dev-tooling`:** ensure triggers include “eristack check”, “dev plan”, “unified CI”.

---

## 10. Token budget scenarios (simulated agent paths)

### Scenario 1: “Add invoice line math to form”

**Ideal path (3 files):**

1. `@eristack/qups#qups-line`
2. `packages/capability/qups/docs/getting-started.md`
3. Done

**Actual path today:** qups-line + qups-core (4 sources) + money-amounts if tax mentioned + doc-number if SEQ → **5–7 files**

**Savings after fix:** qups-line skill embeds tax pointer one-liner; recipe trigger “invoice line”.

### Scenario 2: “Wire login with Drizzle”

**Ideal:** jwt-auth-adapters skill with inline drizzle block  
**Actual:** jwt-auth-adapters opens **12 sources**  
**Savings:** 1 wiring doc → **−11 file reads**

### Scenario 3: “Stock FIFO valuation”

**Ideal:** valuations-core + drizzle adapters test proof  
**Actual:** valuations-core + adapters stub + consumer reads source for 7 methods  
**Savings:** method matrix doc table + parametric tests → trust without source

### Scenario 4: “What eristack package for X?”

**Ideal:** recommend-eristack skill ≤80 lines + generated catalog link  
**Actual:** 270-line skill with full catalog embed  
**Savings:** ~190 lines per recommend load

---

## 11. Documentation improvement backlog (docs-only ids)

See [improvement-backlog.md](./improvement-backlog.md) for DOC-* ids. Summary:

| Priority | Count | Theme |
| --- | ---: | --- |
| P0 | 4 | loadPlan, fat skills, AGENTS block |
| P1 | 8 | Recipe triggers, stub skills, mirrors |
| P2 | 6 | Web CTAs, ticket getting-started, lint rules |

---

## 12. Definition of done — agent UX (future)

An integrator agent task is **done** when:

1. `recommend()` returns recipe with `canonicalSkills`
2. `loadPlan()` loads ≤3 skills total
3. Each skill body contains minimal copy-paste + one `sources` entry
4. Production path named “drizzle” has passing integration test
5. `pnpm eristack check --profile pr` green

**Current monorepo meets 1 partially, 2 no, 3 partial, 4 no, 5 yes.**
