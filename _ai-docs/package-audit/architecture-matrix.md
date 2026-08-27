# Architecture matrix — adapters, exports, tests, skills

Snapshot of all 20 publishable packages. Use for gap spotting and cross-package planning.

**Legend**

- **Drizzle:** P = production store/SQL tested · p = partial (column helpers only) · r = re-export only · — = none
- **Tests:** ● = strong · ◐ = partial · ○ = thin · ◌ = critical gap
- **Memory on main:** ✗ = violates target · ~ = acceptable (backseat alpha) · ✓ = clean
- **Skill:** fat = >3 sources · stub = no copy-paste · ok = meets target

---

## Master matrix

| Package | Ver | Core | drizzle | rest | zod | express | nest | client | react | backseat | drizzle test | unit tests | memory main | skill | docs pages |
| --- | ---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- | ---: |
| money | 0.3.1 | ✓ | p | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | p | ● | ✓ | fat | 23 |
| timestamp | 0.1.0 | ✓ | p | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | p | ● | ✓ | ok | 18 |
| doc-number | 0.3.2 | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ◌ | ● | ✗ | fat | 12 |
| qups | 0.3.1 | ✓ | ✓ | — | — | — | — | — | — | ✓ | ◌ | ● | ✗ | ok | 10 |
| stock-movement | 0.1.1 | ✓ | r | — | — | — | — | — | — | — | ◌ | ○ | ✓ | stub | 6 |
| financial-ledger | 0.2.1 | ✓ | r | — | — | — | — | — | — | — | ◌ | ○ | ✓ | stub | 5 |
| valuations | 0.2.1 | ✓ | ✓ | — | — | — | — | — | — | — | ◌ | ◌ | ✗ | stub | 7 |
| hash-chained-ledger | 0.1.1 | ✓ | ✓ | — | — | — | — | — | — | — | ◌ | ◐ | ✗ | ok | 6 |
| data-grid | 0.2.2 | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ◌ | ● | ✓ | fat | 14 |
| jwt-auth | 0.4.2 | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | P | ● | ✗ | fat | 15 |
| rbac | 0.2.1 | ✓ | ✓ | — | — | ✓ | ✓ | — | ✓ | — | ◌ | ○ | ✗ | stub | 6 |
| abac | 0.2.1 | ✓ | — | — | — | ✓ | ✓ | — | ✓ | — | — | ◐ | ✓ | ok | 5 |
| pbac | 0.2.1 | ✓ | — | — | — | ✓ | ✓ | — | ✓ | ✓ | — | ◐ | ✓ | stub | 6 |
| epoch | 0.1.0 | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ◌ | ◐ | ✗ | stub | 7 |
| backseat | 0.1.2 | ✓ | — | — | — | — | — | — | — | — | — | ◐ | ~ | ok | 8 |
| multitab | 0.2.1 | ✓ | — | — | — | — | — | — | ✓ | — | — | ◐ | ✓ | ok* | 6 |
| ai-knowledge | 0.1.9 | ✓ | — | — | — | — | — | — | — | — | — | ● | ✓ | meta | 12 |
| ai-workflow | 0.1.1 | ✓ | — | — | — | — | — | — | — | — | — | ● | ✓ | ok | 5 |
| ai-ticket-generator | 0.1.1 | ✓ | — | — | — | — | — | — | — | — | — | ◐ | ✓ | ok | 3 |
| ai-dev | 0.0.0 | ✓ | — | — | — | — | — | — | — | — | — | ○ | ✓ | ok | 4 |

\*multitab missing from AGENTS.md intent block

---

## Dependency matrix (runtime)

Rows depend on columns. `w` = workspace:* in dependencies (publish leak). `.` = peer/dev only. `—` = no dep.

|  | money | timestamp | HCL | data-grid | doc-number | jwt | drizzle-orm |
| --- | --- | --- | --- | --- | --- | --- | --- |
| money | — | — | — | — | — | — | p |
| timestamp | — | — | — | — | — | — | p |
| doc-number | . | w | — | w | — | — | p |
| qups | w | — | — | — | — | — | p |
| data-grid | — | w | — | — | — | — | p |
| jwt-auth | . | — | — | w | — | — | p |
| financial-ledger | w | — | w | — | — | — | p |
| stock-movement | — | — | w | — | — | — | p |
| valuations | w | — | w | — | — | — | p |
| hash-chained-ledger | — | — | — | — | — | — | p |
| rbac | — | — | — | — | — | — | p |
| epoch | — | — | — | . | — | — | p |
| pbac | — | — | — | — | — | — | — |
| abac | — | — | — | — | — | — | — |
| backseat | — | — | — | . | . | . | — |
| multitab | — | — | — | — | — | — | — |
| ai-knowledge | — | — | — | — | — | — | — |
| ai-workflow | — | — | — | — | — | — | p |
| ai-dev | — | — | — | — | — | — | — |

**Action:** all `w` cells → peer + dev workspace (backlog D-001).

---

## Backseat registration matrix

| Package | register.ts | normalizeBasePath copy | listRoutes | jsonError | atomic store |
| --- | :---: | :---: | :---: | :---: | :---: |
| jwt-auth | ✓ | ✓ | ✓ | ✓ | — |
| doc-number | ✓ | ✓ | partial | ✓ | — |
| data-grid | ✓ | ✓ | ✓ | ✓ | — |
| epoch | ✓ | ✓ | partial | ✓ | — |
| qups | ✓ | ✓ | ◌ | partial | — |
| pbac | ✓ | ✓ | ◌ | ◌ | — |
| backseat | core | — | ✓ | ✓ | ✓ |

**Target:** X-001 helpers dedupe normalizeBasePath column.

---

## Export surface — registries consumers should not duplicate

| Package | Exported registries / helpers | Documented in skill? |
| --- | --- | --- |
| money | validators, naming presets | partial |
| timestamp | wall compare helpers | partial |
| qups | QUPS_TRUTH_MODES, field validators | yes |
| data-grid | FILTER_OPS, compareDecimalStrings, compareWallValues | partial |
| doc-number | ResetPeriod, token patterns | yes |
| pbac | documents.* helpers | partial |
| abac | attrs helpers | partial |
| epoch | scope types | stub |
| ai-knowledge | recommend, loadPlan | yes |

**Gap:** recipe triggers don't mention several registries (backlog B-008–B-010).

---

## Test coverage matrix (by domain behavior)

| Behavior | Package | Covered? |
| --- | --- | --- |
| Money string arithmetic | money | ● |
| Same-currency tax/discount | money | ● |
| Wall DST gap/overlap | timestamp | ● |
| Instant UTC facts | timestamp | ● |
| QUPS 2-of-3 truth modes | qups | ● |
| applyCellPatch | qups | ● |
| Format {SEQ:n} reset period | doc-number | ● |
| Timezone scope tokens | doc-number | ◐ |
| Hash tamper detect | hash-chained-ledger | ● (core only) |
| Ledger append drizzle | hash-chained-ledger | ◌ |
| FIFO consume | valuations | ● |
| LIFO/FEFO/HIFO/LOFO | valuations | ◌ |
| Weighted/standard/specific | valuations | ◌ |
| Filter ops all types | data-grid | ● |
| Cursor pagination | data-grid | ● |
| executeDrizzleList SQL | data-grid | ◌ |
| executeBackseatList | data-grid | ● |
| Login + refresh rotation | jwt-auth | ● |
| Express router E2E | jwt-auth | ◌ |
| RBAC can() | rbac | ○ |
| ABAC assignmentPairMatch | abac | ● |
| PBAC transitions() | pbac | ● |
| Epoch bumpMany | epoch | ◐ |
| Backseat atomic | backseat | ◐ |
| recommend() scoring | ai-knowledge | ● |
| loadPlan canonical | ai-knowledge | ◌ |
| ai-dev plan json | ai-dev | ● |

---

## CI gate matrix

| Gate | Enforces | Packages affected |
| --- | --- | --- |
| build | dist exists | all 20 |
| exports:check | export map + dist | all 20 |
| docs:check | _meta.json | all with docs |
| knowledge:check | catalog sync | ai-knowledge |
| changesets:check | 0.x rules | changed packages |
| eristack check pr | skills, tickets, … | repo-wide |
| test per package | vitest | all 20 |
| integration | drizzle SQL | **none yet** |
| examples build | examples/* | **none yet** |
| publish deps | no workspace:* | **none yet** |
| skill sources max | ≤3 sources | **none yet** |
| mirror hash | knowledge/docs | **none yet** |

---

## Layer map (filesystem order)

| Layer | Packages | Collective grade |
| --- | --- | --- |
| primitive | money, timestamp | **A−** |
| capability | doc-number, qups, stock-movement, financial-ledger, valuations | **B−** (dragged by ledgers) |
| service | data-grid, epoch, jwt-auth, rbac, abac, pbac, hash-chained-ledger | **B−** |
| infrastructure | backseat | **B** |
| ui | multitab | **B+** |
| ai | ai-knowledge, ai-workflow, ai-ticket-generator, ai-dev | **B** |

---

## Adapter completeness score (0–10)

Subjective integrator-ready score.

| Package | Score | Missing for 10 |
| --- | ---: | --- |
| money | 9 | express/nest tests |
| timestamp | 9 | skill compression |
| jwt-auth | 8 | E2E express, peer deps |
| qups | 8 | drizzle test |
| data-grid | 7 | drizzle SQL test |
| doc-number | 7 | drizzle concurrency |
| multitab | 7 | React smoke |
| pbac | 7 | adapter skill + 409 test |
| abac | 7 | guard tests |
| ai-knowledge | 8 | loadPlan fix |
| backseat | 7 | IndexedDB CI |
| epoch | 6 | drizzle + react test |
| rbac | 5 | drizzle + skill |
| hash-chained-ledger | 5 | drizzle test |
| financial-ledger | 4 | drizzle + tests |
| stock-movement | 4 | drizzle + tests |
| valuations | 3 | 7 methods + drizzle |
| ai-workflow | 7 | MCP tests |
| ai-ticket-generator | 6 | getting-started |
| ai-dev | 6 | check/MCP tests, 0.1.0 |

**Monorepo adapter mean:** **6.8 / 10**

---

## Package × sprint ownership

| Package | Primary sprint | Backlog ids |
| --- | --- | --- |
| hash-chained-ledger | A | A-002, B-014 |
| data-grid | A | A-003, A-004, B-007, D-004 |
| valuations | A | A-005, A-006, DOC-001 |
| doc-number | A | A-007, B-005, D-005 |
| jwt-auth | C,D | C-008, B-004, D-003 |
| qups | A,B | A-012, B-017 |
| stock-movement | A | A-011 |
| financial-ledger | A | A-010, DOC-005 |
| rbac | A,B | A-008, B-013 |
| epoch | A,C | A-009, C-010 |
| pbac | C,X | C-003, X-004, T-005 |
| backseat | C,X | C-007, X-001–X-006 |
| money | B,D | B-006, T-004 |
| timestamp | B | B-018 |
| ai-knowledge | B | B-001–B-003, B-008–B-016 |
| ai-dev | D,T | A-014, D-007, D-008, T-001–T-003 |
| multitab | B,C | B-011, C-009 |
| examples | C | C-001–C-006 |
| root/CI | D | D-002, C-005, B-012 |

---

## Visual — production path proof

```
                    ┌─────────────────────────────────────┐
                    │         Agent / Consumer            │
                    └─────────────────┬───────────────────┘
                                      │ skills + docs
                                      ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    qups      │   │  data-grid   │   │  jwt-auth    │   │  doc-number  │
│  calculateLine│   │ executeList  │   │    login     │   │    next()    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │                  │
       │    TESTED        │   NOT TESTED     │ TESTED (partial) │  PARTIAL
       ▼                  ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        drizzle-orm + sqlite/pg                           │
│  ◌ HCL store   ◌ executeDrizzleList   ◐ jwt stores   ◌ seq concurrency   │
└──────────────────────────────────────────────────────────────────────────┘
       ▲                  ▲                  ▲                  ▲
       │                  │                  │                  │
┌──────┴───────┐   ┌──────┴───────┐   ┌──────┴───────┐   ┌──────┴───────┐
│ stock-move   │   │  valuations  │   │ financial-   │   │    epoch     │
│  movement    │   │   FIFO...    │   │   ledger     │   │   bumpMany   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
       ◌                  ◌                  ◌                  ◌
```

**Goal state:** all ◌ → ● via Sprint A harness.

---

## ticket.yaml presence

All 20 packages: **yes** — no action.

---

## Changeset readiness (0.x)

| Package | Risk | Note |
| --- | --- | --- |
| ai-dev | publish 0.1.0 | minor changeset staged |
| valuations | patch after A-005 | behavior tests may expose bugs |
| hash-chained-ledger | patch after A-002 | |
| All 0.1.x | patch only | changesets:check enforces |

---

## Matrix maintenance

When promoting backlog items:

1. Update this file row (drizzle test column, skill column).
2. Update [per-package.md](./per-package.md) grade if warranted.
3. Tick [improvement-backlog.md](./improvement-backlog.md) status.
4. Do **not** auto-edit roadmap/priorities.
