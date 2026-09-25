# Index: Household personal finance → @eristack batch (2026-09-25)

> Cover letter for maintainers. **Ingest date:** filename prefix `20260925` (same calendar day as Horizon B batch; different time suffixes are not different days). Each row is a portable ticket file.

## Meta

- **id:** `20260925-index-household-personal-finance-eristack-gaps`
- **kind:** suggestion-batch-index
- **reporter:** household (personal finance tracker consumer)
- **created:** 2026-09-25
- **global stack:** [20260925-index-maintainer-priority-stack.md](./20260925-index-maintainer-priority-stack.md) (ranks 1–2, 5–8, 16–24 interleave with Tiga Sekawan Horizon B)

---

## Why this batch exists

Household ledger work hit **timestamp parse errors surfacing as `BUSINESS_POLICY_DENIED`**, multi-currency display/conversion gaps, and **HTTP error mapping** that agents reinvent per app. This batch is glue for a **small ledger app** (not document-with-lines ERP). It deliberately asks for **recipes and examples** where Horizon B asks for **Backseat/Drizzle ports**.

---

## Priority stack (maintainer triage)

| Priority | Ticket file | Package | Ask |
| --- | --- | --- | --- |
| P0 | `20260925-163554-bug-instantof-throws-raw-temporal-error-on-wall-loca-341a0a.md` | `@eristack/timestamp` | `TimestampParseError` instead of raw Temporal on wall-local ISO |
| P0 | `20260925-163554-suggestion-asinstant-helper-for-journal-and-invoice-planner-e252b3.md` | `@eristack/timestamp` | `asInstant` routes wall JSON vs instant JSON |
| P1 | `20260925-163607-suggestion-mapdomainerror-table-for-timestamp-zod-and-uniqu-62cbd9.md` | `@eristack/ai-knowledge` | `http-errors` mapDomainError table |
| P1 | `20260925-163606-suggestion-displaybalance-for-credit-normal-accounts-286c48.md` | `@eristack/financial-ledger` | `displayBalance` for credit-normal accounts |
| P1 | `20260925-163555-suggestion-currency-scale-display-string-without-number-f516d5.md` | `@eristack/money` | Scale-aware display string without `Number()` |
| P1 | `20260925-163555-suggestion-dated-conversion-asof-and-rate-pick-invert-pivot-9ac934.md` | `@eristack/money` | `convertAt` / as-of FX without `Date` |
| P2 | `20260925-163614-suggestion-catalog-note-skip-data-grid-on-tiny-household-re-3812f9.md` | `@eristack/ai-knowledge` | Recipe note — skip data-grid on tiny apps |
| P2 | `20260925-163606-suggestion-calendar-year-open-periods-bootstrap-factory-e5b684.md` | `@eristack/fiscal-calendar` | Calendar-year open periods factory |
| P2 | `20260925-163607-suggestion-ledger-first-architecture-recipe-and-recommend-r-63d850.md` | `@eristack/ai-knowledge` | Ledger-first recipe (`partial`) |
| P2 | `20260925-163607-suggestion-one-epoch-per-aggregate-recipe-for-tanstack-quer-5aa09b.md` | `@eristack/epoch` | One epoch per aggregate recipe (`partial`) |
| P2 | `20260925-163606-suggestion-vite-express-login-path-wiring-example-5b83a9.md` | `@eristack/jwt-auth` | Vite + Express login path example (`partial`) |
| P2 | `20260925-163555-suggestion-express-5-mount-via-dispatch-instead-of-splat-ca-90fba8.md` | `@eristack/rest` | Express 5 dispatch mount (`partial`) |
| P2 | `20260925-163613-suggestion-recipe-masters-are-not-pbac-documents-191567.md` | `@eristack/opinion` | Masters ≠ PBAC documents (recipe) |
| P3 | `20260925-163607-suggestion-propose-eristack-chart-posting-tree-capability-01a5dd.md` | `@eristack/ai-knowledge` | Chart-of-accounts capability proposal (`partial`) |

---

## What we are **not** asking for

- Full ERP document-with-lines packages
- Stock movement, valuations, or warehouse ledgers in v1
- Production IndexedDB as the default persistence story

---

## How to send

Attach individual `.md` files from `tickets/`. Regenerate with:

```bash
pnpm exec eristack-ticket suggest --out tickets
```

Update ordering in `tickets/triage.yaml` and run `pnpm ticket:triage check`.
