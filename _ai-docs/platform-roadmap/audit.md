# Platform roadmap — full package audit

> Cross-reference: [overview](./overview.md) · [upgrades](./upgrades.md)

**Audit date:** 2026-08-27 · **Packages:** 19 publishable · **Features layer:** 0

**Reference adapter stack (T0):** `core` + `drizzle` + `rest` + `zod` + `express` + `nest` + `client` + `react`

---

## Summary scorecard

| Category | Count | Avg maturity | Adapter completeness | Doc depth | Test depth | Strategic priority |
| --- | ---: | --- | --- | --- | --- | --- |
| Primitive | 2 | High | ★★★★★ | Rich | Good | Maintain + extend |
| Capability | 6 | Mixed | ★★☆☆☆ | Mixed | **Weak on ledgers** | **Harden ledgers** |
| Service | 8 | Mixed | ★★★☆☆ | Mixed | jwt-auth best | Zod + policy clarity |
| Infrastructure | 1 | Alpha | N/A | Rich | OK | M3 + rest pairing |
| UI | 1 | Alpha | React only | Medium | OK | Alpha → beta |
| AI | 3 | Tooling | N/A | Medium | OK | Recipes + scaffold |
| Features | 0 | — | — | Roadmap only | — | **Blocked on spine** |

---

## Tier legend

| Symbol | Meaning |
| --- | --- |
| **S** | Stable 0.x — production-ready core, active consumers |
| **E** | Early 0.x — API may move, needs hardening |
| **A** | Alpha — explicit non-production |
| **T** | Tooling — not runtime dependency |

---

## Primitive layer

### `@eristack/money` — **S** · T0 reference

| Dimension | Assessment |
| --- | --- |
| Version | 0.3.1 |
| Core | `Money.of`, arithmetic, rounding, allocate, conversion, tax/discount operators, JSON |
| Adapters | Full T0 stack (8 subpaths) |
| Docs | 23 pages, ~2.5k lines — **gold standard** |
| Tests | 3 files — good for core, light on adapter matrix |
| Skills | money-amounts, money-ledger, money-adapters |

**Gaps:** Pre-1.0; no Postgres-specific drizzle notes; FX remains app-owned (correct).

**Priority:** P2 maintain — add multi-currency reporting helpers export if consumers duplicate.

---

### `@eristack/timestamp` — **E→S** · T0 reference

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.0 |
| Core | instant + wall modes, IANA zones, DST-safe wall→instant |
| Adapters | Full T0 (mirrors money) |
| Docs | 18 pages — rich |
| Tests | 2 files — expand wall/DST edge cases |

**Gaps:** Newest primitive, lower semver; recipe language for "timezone", "UTC column" could be richer.

**Priority:** P2 — bump confidence via tests; link fiscal-calendar package when it exists.

---

## Capability layer

### `@eristack/doc-number` — **S** · T1

| Dimension | Assessment |
| --- | --- |
| Version | 0.3.2 |
| Core | Formats, sequences, tokens, reset periods, peek/next |
| Adapters | T1 minus **zod** |
| Docs | Rich (11 pages) |
| Tests | 5 files — good |

**Gaps:** No `./zod`; adapter docs consolidated vs per-subpath.

**Priority:** P1 — add zod; OpenAPI types via `@eristack/rest`.

---

### `@eristack/qups` — **S** · T2 (incomplete surface)

| Dimension | Assessment |
| --- | --- |
| Version | 0.3.1 |
| Core | calculateLine/patchLine, 2-of-3 SoT, modifiers, tax on Money |
| Adapters | drizzle + backseat **only** |
| Docs | Medium (11 pages) |
| Tests | 3 files |

**Gaps:** **No express/nest/react** despite being the #1 form-integration package. Agents must read core + manually wire TanStack Form.

**Priority:** P0 — either full T1 adapters OR canonical `examples/qups-form` + skill that says "headless by design" with copy-paste blocks.

---

### `@eristack/stock-movement` — **E** · T2

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.1 |
| Core | locationIdFromParts, append/snapshot/verify, hash chain |
| Adapters | drizzle + backseat |
| Docs | **Thin** (6 pages, ~290 lines) |
| Tests | **1 file** — highest regression risk |

**Gaps:** Thin docs vs complexity; no integration test with real Drizzle Postgres; no posting idempotency story.

**Priority:** P0 hardening.

---

### `@eristack/financial-ledger` — **E** · T2

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 |
| Core | post/list/snapshot/verify by accountId+currency |
| Adapters | drizzle + backseat |
| Docs | **Thin** (5 pages) |
| Tests | **1 file** |

**Gaps:** Multi-currency trial balance helpers missing; no standard chart-of-accounts types (app-owned, but export AccountId patterns).

**Priority:** P0 hardening + posting bus integration.

---

### `@eristack/valuations` — **E** · T2

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 |
| Core | FIFO/LIFO/FEFO/HIFO/LOFO/averages/standard/specific |
| Adapters | drizzle + backseat (ledger + layers) |
| Docs | **Thin** (6 pages) |
| Tests | **1 file** |

**Gaps:** Complex domain, minimal proof; COGS snapshot API for feature-sales unclear.

**Priority:** P0 hardening + COGS export for O2C.

---

### `@eristack/hash-chained-ledger` — **E** · T2 foundation

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.1 |
| Core | append/snapshot/verify, SHA-256 chain, tamper detection |
| Adapters | drizzle + backseat |
| Docs | Thin-medium (7 pages) |
| Tests | 2 files |

**Gaps:** No standalone recipe for "audit trail" / "tamper detection"; under-documented as foundation for 4 packages.

**Priority:** P0 docs + recipe + cross-package integration tests.

---

## Service layer

### `@eristack/jwt-auth` — **S** · T1 (most mature service)

| Dimension | Assessment |
| --- | --- |
| Version | 0.4.2 |
| Core | login, refresh rotation, revoke, credential stores |
| Adapters | Full T1 minus **zod** |
| Docs | Rich (12 pages) |
| Tests | **7 files** — best in monorepo |

**Gaps:** No zod for credential/session DTOs; no OAuth/OIDC (out of scope?); no MFA hooks.

**Priority:** P1 zod + optional `./prisma` stores.

---

### `@eristack/data-grid` — **S** · T1

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.2 |
| Core | filters, sorts, cursor/offset, advanced mode, in-memory apply |
| Adapters | Full T1 minus **zod** |
| Docs | Rich (10 pages) |
| Tests | 1 file — thin for query edge cases |

**Gaps:** No zod; decimal/money column filter types could export more helpers; Nest example missing.

**Priority:** P1 zod + Nest example parity.

---

### `@eristack/epoch` — **E** · T1

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.0 |
| Core | data-version epochs, cache policy, StaleEpochError |
| Adapters | Full T1 minus **zod** |
| Docs | Thin-medium (5 pages) |
| Tests | 1 file |

**Gaps:** New package; TanStack Query integration under-documented in examples.

**Priority:** P1 example + zod + skill refresh.

---

### `@eristack/rbac` — **S** · T3

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 |
| Core | roles, permissions, can/authorize |
| Adapters | drizzle, express, nest, react, backseat — **no rest/client** |
| Docs | Medium (8 pages) |
| Tests | 1 file |

**Gaps:** No headless REST admin API; no zod.

**Priority:** P2 — add rest/client if admin UI pattern emerges; else document middleware-only tier.

---

### `@eristack/abac` — **S** · T4

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 |
| Core | registerPolicy, evaluate/authorize, attrs |
| Adapters | express, nest, react, backseat — **empty drizzle/ dir** |
| Docs | Medium (9 pages) |
| Tests | 1 file |

**Gaps:** Empty `src/drizzle/` placeholder — decision needed: stateless forever vs policy persistence.

**Priority:** P2 — **decision doc** + delete empty dir or implement policy registry store.

---

### `@eristack/pbac` — **S** · T4

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 |
| Core | document policies, check/authorize, state helpers |
| Adapters | Same as abac |
| Docs | Medium (8 pages) |
| Tests | 1 file |

**Gaps:** Same drizzle placeholder; **critical for feature layer** — needs document transition recipe library.

**Priority:** P0 for features — pbac transition templates for PO/GR/invoice.

---

## Infrastructure layer

### `@eristack/backseat` — **A**

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.2 |
| Core | in-browser REST engine, IndexedDB, adapter registry |
| Docs | Rich (9 pages) — alpha limits clear |
| Tests | 3 files |

**Gaps:** M3 PO→GR flows incomplete; no shared REST contract with `@eristack/rest` (planned).

**Priority:** P1 M3 + align with rest package.

---

## UI layer

### `@eristack/multitab` — **A**

| Dimension | Assessment |
| --- | --- |
| Version | 0.2.1 (docs say 0.1.0 — **skew**) |
| Core | headless tab reducer, route sync hooks |
| Adapters | react, react/tanstack |
| Docs | Medium (5 pages) |
| Tests | 3 files |

**Gaps:** Alpha; no styled components; doc/version mismatch.

**Priority:** P1 alpha → beta with doc-shell integration.

---

## AI layer

### `@eristack/ai-knowledge` — **T**

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.9 |
| Core | recommend(), loadPlan(), catalog sync |
| Docs | Medium (9 pages) |
| Recipes | 22 recipes — gaps for ai-workflow, scaffolding, standalone hash-chain |

**Priority:** P0 recipe expansion every wave.

---

### `@eristack/ai-workflow` — **T**

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.1 |
| Core | MCP, FTS+vector, sprint/backlog tools |
| Docs | Medium — **no primary recipe** |
| Tests | 4 files |

**Priority:** P1 recipe + getting-started prominence.

---

### `@eristack/ai-ticket-generator` — **T**

| Dimension | Assessment |
| --- | --- |
| Version | 0.1.1 |
| Core | bug/suggestion tickets, feasibility |
| Docs | Medium — **no getting-started.md** |
| Tests | 1 file |

**Priority:** P2 doc page + promote _ai-docs folder.

---

## Features layer

**Status:** 0 packages · 14 planned in `roadmap/erp.md`

**Blockers:** spine demo, pbac templates, partner/product schema, multitab workspace.

---

## Cross-package dependency graph (simplified)

```text
hash-chained-ledger
    ├── stock-movement
    ├── financial-ledger
    └── valuations (also layer store)

money ──► qups ──► feature-* lines
timestamp ──► doc dates, epoch, fiscal-calendar (planned)

jwt-auth + rbac/abac/pbac ──► all HTTP features
doc-number + data-grid + epoch ──► all document UIs
multitab + backseat ──► ERP workspace UX
```

---

## Audit conclusions

### Critical path (must fix before features)

1. Ledger stack tests + docs (4 packages, 4–5 test files total today)
2. QUPS integration story (adapters or example)
3. PBAC document transition library
4. PO→GR runnable demo
5. Recipe coverage for agent discovery

### Healthy (maintain)

- money, timestamp, jwt-auth, doc-number, data-grid, backseat docs

### Decide explicitly

- abac/pbac: stateless vs drizzle persistence
- qups: T1 adapters vs headless + examples
- rbac: add rest/client or stay middleware-only

### Version hygiene

- multitab doc/version skew
- ai-ticket-generator missing getting-started
