# Tonight v2 — generic layer work (no features, no ERP spines)

> **Rule:** Vision → [overview.md](./overview.md) + [backlog.md](./backlog.md). **Only this file is the execution schedule.**

---

## Constraints (session)

| Do | Don't |
| --- | --- |
| Primitives → capability → service → infrastructure → UI | `@eristack/feature-*`, procurement verticals |
| Generic APIs any ERP can use | ERP spine recipes, `examples/erp-spine`, compose guides |
| Tiga Sekawan tickets as **signal**, not custom forks | Stock/GL/valuations as default for document ERPs |

**Removed this session:** `procurement-spine` recipe, `knowledge/procurement-spine.md`, `knowledge/pbac-transitions.md`, `examples/erp-spine`.

**Kept (generic):** stock `idempotencyKey`, hash-chain tests, `hash-chain-audit` + `ai-workflow-memory` recipes.

---

## North star (revised)

Agents wiring **document + cost-sheet ERPs** (Backseat Horizon A → Drizzle Horizon B) finish in ≤3 files using **existing layers** — without `recommend()` pushing inventory/GL paths or inventing Date/FX/wall math.

---

## Tonight definition of done

| # | Deliverable | Package | Status |
| --- | --- | --- | --- |
| T1 | `convertAtQuotePerBase` + golden test (1500 USD × 16250 → 24375000 IDR) | `@eristack/money` | done |
| T2 | `compareWall`, `isWallInRange`, `addWallDays` + tests | `@eristack/timestamp` | done |
| T3 | `documents.transitions()` + test | `@eristack/pbac` | done |
| T4 | `epoch.bumpMany()` + test | `@eristack/epoch` | done |
| T5 | Remove procurement spine artifacts | ai-knowledge + examples | done |
| T6 | Plan refresh (this file) | `_ai-docs/platform-roadmap` | done |
| T7 | `store.atomic()` multi-collection writes | `@eristack/backseat` | done |
| T8 | Format `timezone` + IANA period keys (`Asia/Jakarta`) | `@eristack/doc-number` | done |
| T9 | `type: wall` + `executeBackseatList` | `@eristack/data-grid` | done |
| T10 | `applyCellPatch` + `withQupsFields` | `@eristack/qups` | done |
| T11 | Backseat-then-backend guide + recipe | `@eristack/ai-knowledge` | done |
| T12 | `matchesAssignmentPair` + `attrs.assignmentPairMatch` | `@eristack/abac` | done |
| T13 | Dual-target auth client docs | `@eristack/jwt-auth` | done |
| T14 | `listRoutes()` + routes snapshot + Devtools tab | `@eristack/backseat` | done |
| T15 | `jsonError` / `versionConflict` envelope | `@eristack/backseat` | done |
| T16 | Scoped sequences + `{SCOPE}` token | `@eristack/doc-number` | done |
| T17 | `document-lines-erp` + `optimistic-document-version` recipes | `@eristack/ai-knowledge` | done |

---

## Next session

**2026-08-27 Tiga Sekawan ticket batch: complete.** Older tickets (2026-08-22 multitab, jwt scrypt) already shipped upstream.

See [backlog.md](./backlog.md) for full wave index.

---

## Verify locally

```bash
pnpm --filter @eristack/money test
pnpm --filter @eristack/timestamp test
pnpm --filter @eristack/pbac test
pnpm --filter @eristack/data-grid test
pnpm --filter @eristack/qups test
pnpm --filter @eristack/abac test
pnpm knowledge:sync && pnpm knowledge:check
```
