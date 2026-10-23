# Maturity refresh vs Aug 2026 audit (STAB-MAT-1)

**Baseline:** `_ai-docs/audit/executive-summary.md` (B− library, C+ integrator, B meta-tooling).

**Verified:** `pnpm prepush` OK 2026-10-24 (~131s affected path vs `origin/main`).

## Top-15 audit themes → stabilization status

| Rank | Aug audit theme | STAB / evidence | Residual |
| ---: | --- | --- | --- |
| 1 | HCL Drizzle integration | STAB-INT-HCL, STAB-INT-HCL-DEPTH, STAB-INT-HCL-CONCURRENT | Apps add `{prefix}_entries_chain_seq_uq` migration |
| 2 | data-grid `executeDrizzleList` | STAB-INT-DATAGRID; F-002 closed | Join-heavy app SQL still app-owned |
| 3 | Valuations 9 methods + Drizzle | STAB-INT-VAL; F-003 closed | — |
| 4 | `loadPlan()` canonical skills | STAB-AI-2; F-004 closed | — |
| 5 | `workspace:*` in published deps | STAB-PUB-1; F-005 closed | — |
| 6 | Horizon A composite | STAB-EX-HORIZON; examples CI | Horizon B mirror optional |
| 7 | `createMemory*` → `/testing` | STAB-MEM-2; F-007 closed | `apps/old-web` out of scope |
| 8 | Backseat normalizeBasePath | STAB-BS-1; F-008 closed | Register bootstrap patterns may differ |
| 9 | Cross-cutting skill sources | STAB-AI-4; F-009 closed | — |
| 10 | Recipe triggers | STAB-AI-RECIPES; F-010 closed | — |
| 11 | AGENTS intent block | STAB-AI-AGENTS; F-011 closed | — |
| 12 | Examples in CI | F-006/F-012 closed | — |
| 13 | Peer dep floors | STAB-PUB-PEERS; F-013 closed | — |
| 14 | 409 canon demo | STAB-EX-HTTP-409; F-014 closed | Express mirror optional |
| 15 | Trim recommend-eristack embed | STAB-AI-3; F-015 closed | — |

## Suggested grade deltas (integrator-facing packages only)

| Package | Aug | Oct 2026 (post-STAB) | Why |
| --- | --- | --- | --- |
| `@eristack/hash-chained-ledger` | C | **B** | Drizzle integration + depth + concurrent append |
| `@eristack/data-grid` | B− | **B** | Drizzle list integration |
| `@eristack/valuations` | D+ | **B−** | All methods on Drizzle smoke |
| `@eristack/rbac` / `@eristack/epoch` | C+ | **B−** | Drizzle integration tests; memory off root |
| `@eristack/ai-dev` | C+ | **B** | Check registry + CI profiles exercised |
| `@eristack/ai-knowledge` | A− | **A−** | loadPlan fixed; routing tests expanded |

**Monorepo integrator experience (informal):** C+ → **B−** (gates enforce what docs claim; Drizzle path proven for spine stores).

## Phase 4 optional backlog

- Full per-package letter-grade pass (71 rows) — not required for stabilization exit.
- Refresh `_ai-docs/audit/` snapshot when product wants a new external grade card.
- 3ss B4 SQL codegen — **F-018 waived**; track in `roadmap/` not stabilization.
