# Suggestion: Assignment scope SQL + in-memory prefilter parity

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201503-suggestion-assignment-scope-sql-and-prefilter-parity-j0k1l2`
- **kind:** suggestion
- **package:** `@eristack/abac`
- **feasibility:** `possible`
- **created:** 2026-09-25T20:15:03.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Role × Branch × Trade scope filters job/invoice lists. Horizon A uses `executeBackseatList({ prefilter })`; Horizon B uses SQL `OR (branch_id, trade)` with `executeDrizzleList`. Divergence is a security bug. Ship paired helpers with shared tests.

## User story

As a multi-branch forwarder I want the same assignment scope on IndexedDB lists and Drizzle list queries.

## Proposed behavior

- `assignmentScopePrefilter(assignments, getBranchTrade)` for document prefilter.
- `assignmentScopeWhere(columns: { branchId, trade }, assignments)` for Drizzle `SQL` fragment.
- **Empty assignments ⇒ match nothing** (canonical default).
- Re-export or co-locate in `@eristack/data-grid/drizzle` for discoverability.

## Proposed API

```ts
// @eristack/abac or @eristack/data-grid/drizzle
export function assignmentScopeWhere(
  columns: { branchId: GridColumn; trade: GridColumn },
  assignments: ReadonlyArray<AssignmentPair>,
): SQL;

export function assignmentScopePrefilter(
  assignments: ReadonlyArray<AssignmentPair>,
  doc: { branchId: unknown; trade: unknown },
): boolean;
```

Build on existing `matchesAssignmentPair`.

## Feasibility rationale

Small pure functions + tests; extends shipped assignment-pairs ticket.

## Implementation sketch

- Shared fixture: two assignments, three jobs, assert same ids from SQL and prefilter paths.
- Document compose with `buildDrizzleQuery` `where` AND scope.

## Risks

- Apps with different scope dimensions (warehouse, owner) need extension points—not hard-code only branch/trade in API name if generic `assignmentScopeWhere` accepts field getters.

## Alternatives

- App copies SQL OR clauses — Tiga Sekawan did (`packages/db/src/filters/assignment-scope-where.ts`).

## Agent handoff

1. Load `@eristack/abac#abac-core` and `@eristack/data-grid#data-grid-adapters`.
2. Add helpers + tests; document in document-lines-erp recipe.
3. Changeset if new exports.

## Notes

Related: `20260827-140918-suggestion-resource-in-assignment-pairs-helper-for-role-x-b-784143.md`.

### Consumer evidence

`executeBackseatList` prefilter vs `listJobsFromDrizzle` / `listInvoicesFromDrizzle` with `assignmentScopeWhere`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
