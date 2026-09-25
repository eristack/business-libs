# Ledger-first apps (cashbook / household GL)

**Canonical guide** for personal finance and cashbook products that post journals to `@eristack/financial-ledger` — not document-with-lines ERP. Load: `@eristack/ai-knowledge#ledger-first`.

## When to use

- Chart of accounts → journal lines → balanced postings → hash-chained ledger
- Value dates as `@eristack/timestamp` wall locals (`asInstant` at API boundaries)
- Fiscal periods via `@eristack/fiscal-calendar` (`createCalendarYearCalendar` bootstrap)
- Optional multi-currency reporting with `@eristack/money` — never JS float literals

## When not to use

- Job/cost sheet/commercial invoice with QUPS lines → `#document-lines-erp` instead
- Warehouse FIFO/LIFO → add stock/valuations only when goals say inventory
- `@eristack/qups` as the spine — ledger apps do not start from line pricing calculators

## Spine load order

1. `@eristack/ai-knowledge#ledger-first` (this file)
2. `@eristack/financial-ledger#financial-ledger-core` + `/drizzle` for production store
3. `@eristack/money#money-ledger` — round at boundaries, allocate splits
4. `@eristack/timestamp#timestamp-core` — wall value dates + `asInstant()` on writes
5. `@eristack/fiscal-calendar#fiscal-calendar-core` — `findPeriodForDate` / `assertPeriodOpen`
6. `@eristack/epoch#epoch-core` — one epoch key per aggregate (accounts, transactions); bump after writes
7. `@eristack/jwt-auth` + `@eristack/rbac` when the app has login

## Masters vs documents

**Masters** (accounts, categories, instruments, partners in a cashbook) are app-owned CRUD + epoch bump — not `@eristack/pbac` document graphs or `@eristack/opinion` PATCH `/:id/:action` workflows.

Reserve `@eristack/doc-transitions` / `@eristack/pbac` for true documents (invoices, journals as documents if you model them that way).

## TanStack Query + epoch

- One epoch scope per aggregate root (e.g. `household.accounts`, `household.transactions`).
- After a successful write: `await epoch.bump(scope)` then invalidate Query keys that depend on that scope.
- Do not add a React Query adapter package — use existing `resolveCachePolicy` / client invalidation lists.

## Express 5 + REST

Mount `@eristack/rest` with `mountExpressRest(app, { router, mountPath: "/api" })` — dispatch middleware, not splat `*`. See `@eristack/rest/express`.

## JWT + Vite dev

Login is **`POST /auth/login`** (not under `/api`). Proxy both `/auth` and `/api` in Vite — see `@eristack/jwt-auth` dual-target doc.

## Chart posting tree (roadmap)

Multi-level chart-of-accounts posting trees (parent/child rollups) stay **app-owned** until a dedicated capability ships. Use flat account headers + posting leaves today; track product asks via maintainer tickets — do not block cashbook MVP on a new package.

## recommend() goals

```ts
recommend(["household ledger", "cashbook", "journal posting"]);
loadPlan(recommend(["personal finance"], { product: undefined }));
```

For forwarding/document ERPs use `recommend(goals, { product: "document-lines-erp" })` to suppress default stock/GL recipes.

## Related

- [document-lines-erp](./document-lines-erp.md) — QUPS document spine (different product)
- [http-errors](./http-errors.md) — map `PeriodMissingError` / fiscal denies
- `@eristack/fiscal-calendar` — `createCalendarYearCalendar`, `PERIOD_MISSING_CODE`
