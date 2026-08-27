# Suggestion: Atomic multi-collection writes for document aggregates

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140852-suggestion-atomic-multi-collection-writes-for-document-aggr-91d521`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `partial`
- **created:** 2026-08-27T14:08:52.259Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon A creates a Job and empty CostSheet together. IndexedDB store.get/update is per collection; a failed second write leaves an orphan job. Need store.atomic or a UnitOfWork adapter over the shared Backseat store.

## User story

As a Backseat-first ERP I want one IndexedDB transaction for job + cost sheet + audit so the mockup matches later Drizzle uow.atomic.

## Proposed behavior

store.atomic(async (tx) => { await tx.set('jobs', job); await tx.set('costSheets', sheet); }) rolls back all collections on throw. Same API shape as a domain UnitOfWork.

## Proposed API

BackseatStore.atomic<T>(work: (tx: TransactionalStore) => Promise<T>): Promise<T>

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Add atomic() on IndexedDB store using IDBTransaction across object stores
- Document that memory store tests can run work() without a real txn
- Example: createJob writes jobs + costSheets + epoch bump inside one atomic

## Risks

- IndexedDB transactions cannot include non-IDB awaits (epoch.bump over another store). Document that epoch bump happens after atomic commit, or include epoch object store in the same DB.
- Memory store used in tests must still provide atomic() for port symmetry.
- Breaking if existing apps assumed independent collection writes.

## Alternatives

- App-level compensation (delete job if cost sheet insert fails) — what we will do in Horizon A if this does not ship.
- Put job+sheet in one collection document — fights 1:1 aggregate split in IMPLEMENTATION.md.
- Wait for Horizon B Drizzle transactions only — mockup then lies about atomicity.

## Agent handoff

1. Load Intent skills for `@eristack/backseat`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: `2026-08-27-backseat-sea-job-cost-sheet-mockup` task create job + empty cost sheet.
IMPLEMENTATION §4a UnitOfWork, §4b Horizon A, §19 createJob steps.
Current PO Backseat writes a single collection (`purchaseOrders`) so the gap appears only when Jobs land.

### Consumer evidence (Tiga Sekawan)

Horizon A **must** create Job and CostSheet together (`IMPLEMENTATION.md` invariant 8: exactly one cost sheet per job). Backseat `ctx.store` today is per-collection get/update (see `apps/web/src/backseat/routes/purchase-orders.ts`). Two sequential writes are not a transaction.

Golden path: `createJob` → `JO/2026/00001` + empty draft cost sheet + `job_sea` row. If the process dies after jobs.insert, the register shows a job with no commercial face.

Horizon B `uow.atomic` on Drizzle will be correct. If the mockup is not atomic, CS demos will train the wrong failure mode.

Also needed later for invoice issue (invoice header + lines + cost_sheet_line.invoiced_invoice_id) in sprint `2026-08-27-backseat-invoices-settlement-close`.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
