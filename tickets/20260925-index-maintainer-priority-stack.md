# Index: Maintainer priority stack (2026-09-25)

> **Not a ticket.** Single cross-batch execution order for everything ingested on **2026-09-25** plus pointers to older backlog. Machine source: [`triage.yaml`](./triage.yaml).

## Meta

- **id:** `20260925-index-maintainer-priority-stack`
- **kind:** triage-index
- **as_of:** 2026-09-25
- **ticket count:** 24 ranks in active stack + 25 in backlog tiers (see `pnpm ticket:triage list`)

---

## Date rule (important)

**Ingest date = first 8 characters of the filename** (`YYYYMMDD`). All files starting with `20260925` belong to today’s intake, including:

- `20260925-1635xx-*` (household batch)
- `20260925-2015xx-*` (Tiga Sekawan Horizon B batch)

Do **not** treat `1635` vs `2015` as different days.

---

## Batch indexes

| Batch | Index file | Reporter |
| --- | --- | --- |
| Horizon B mirror | [20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md](./20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md) | Tiga Sekawan ERP |
| Household ledger | [20260925-index-household-personal-finance-eristack-gaps.md](./20260925-index-household-personal-finance-eristack-gaps.md) | household |
| Horizon A (Aug) | [20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md](./20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md) | Tiga Sekawan ERP |

---

## Global stack (ranks 1–24)

Regenerate this table after editing `triage.yaml`:

```bash
pnpm ticket:triage stack --markdown
```

| Rank | P | File | Notes |
| ---: | --- | --- | --- |
| 1 | P0 | `20260925-163554-bug-instantof-throws-raw-temporal-error-on-wall-loca-341a0a.md` | Timestamp bug — journal UI |
| 2 | P0 | `20260925-163554-suggestion-asinstant-helper-for-journal-and-invoice-planner-e252b3.md` | Same PR as rank 1 |
| 3 | P0 | `20260925-201500-suggestion-drizzle-backseat-store-atomic-sqlite-staging-a1b2c3.md` | Horizon B Drizzle atomic |
| 4 | P0 | `20260925-201501-suggestion-backseat-workshop-server-bootstrap-without-vite-d4e5f6.md` | Workshop server boot |
| 5 | P1 | `20260925-163607-suggestion-mapdomainerror-table-for-timestamp-zod-and-uniqu-62cbd9.md` | http-errors table |
| 6 | P1 | `20260925-163606-suggestion-displaybalance-for-credit-normal-accounts-286c48.md` | displayBalance |
| 7 | P1 | `20260925-163555-suggestion-currency-scale-display-string-without-number-f516d5.md` | Money display |
| 8 | P1 | `20260925-163555-suggestion-dated-conversion-asof-and-rate-pick-invert-pivot-9ac934.md` | FX as-of |
| 9 | P1 | `20260925-201502-suggestion-dual-target-api-mirror-contract-testing-cli-g7h8i9.md` | Mirror contract CLI |
| 10 | P1 | `20260925-201503-suggestion-assignment-scope-sql-and-prefilter-parity-j0k1l2.md` | ABAC scope SQL |
| 11 | P1 | `20260925-201508-suggestion-derive-backend-checklist-list-projection-recipe-y5z6a7.md` | Derive-backend recipe |
| 12 | P2 | `20260925-201506-suggestion-express-map-domain-error-unified-adapter-s9t0u1.md` | Express mapDomainError |
| 13 | P2 | `20260925-201505-suggestion-document-store-port-aligned-with-backseat-p6q7r8.md` | Document store port |
| 14 | P2 | `20260925-201507-suggestion-workshop-transport-client-dual-target-v2w3x4.md` | Workshop client |
| 15 | P2 | `20260925-201509-suggestion-recommend-suppress-stock-gl-document-lines-b8c9d0.md` | recommend() profile |
| 16 | P2 | `20260925-163614-suggestion-catalog-note-skip-data-grid-on-tiny-household-re-3812f9.md` | Tiny app recipe |
| 17 | P2 | `20260925-163606-suggestion-calendar-year-open-periods-bootstrap-factory-e5b684.md` | Fiscal calendar |
| 18 | P2 | `20260925-163607-suggestion-ledger-first-architecture-recipe-and-recommend-r-63d850.md` | Ledger-first recipe |
| 19 | P2 | `20260925-163607-suggestion-one-epoch-per-aggregate-recipe-for-tanstack-quer-5aa09b.md` | Epoch recipe |
| 20 | P2 | `20260925-163606-suggestion-vite-express-login-path-wiring-example-5b83a9.md` | Vite login example |
| 21 | P2 | `20260925-163555-suggestion-express-5-mount-via-dispatch-instead-of-splat-ca-90fba8.md` | REST Express 5 |
| 22 | P2 | `20260925-163613-suggestion-recipe-masters-are-not-pbac-documents-191567.md` | Masters vs PBAC |
| 23 | P3 | `20260925-201504-suggestion-drizzle-app-spine-bootstrap-bundle-m3n4o5.md` | needs-decision |
| 24 | P3 | `20260925-163607-suggestion-propose-eristack-chart-posting-tree-capability-01a5dd.md` | CoA capability |

---

## Older backlog (not in ranks 1–24)

| Tier | Status | Where |
| --- | --- | --- |
| Horizon A residual (19 files) | open — verify debottleneck shipping | `triage.yaml` → `backlog.horizon-a-residual` + Aug 27 index |
| Aug 22 QUPS/money/data-grid (3) | verify-shipped | `triage.yaml` → `backlog.provenance-20260822` |
| Aug 14–15 bugs/multitab (3) | verify-shipped | `triage.yaml` → `backlog.early-bugs` |

---

## Maintainer workflow

1. **New ticket file** → add to `tickets/triage.yaml` (`stack` or `backlog`) and the matching batch index if applicable.
2. **`pnpm ticket:triage check`** — every markdown file under `tickets/` is listed; today’s intake must appear in stack or backlog.
3. **`pnpm ticket:triage stack --day 20260925`** — only 2026-09-25 ingest.
4. **Fixer session** — open rank N file; load package skill from ticket **Agent handoff**; changeset if publishable package changes.
5. **Optional** — mirror rank 1–3 into `.eristack/workflow/backlog/items.yaml` via `@eristack/ai-workflow` if you use local sprint memory.

---

## Commands

```bash
pnpm ticket:triage list
pnpm ticket:triage list --day 20260925
pnpm ticket:triage stack
pnpm ticket:triage check
```
