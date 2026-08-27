# Suggestion: First-class Backseat/in-memory list execution for mockup registers

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141023-suggestion-first-class-backseat-in-memory-list-execution-fo-a5c3bf`
- **kind:** suggestion
- **package:** `@eristack/data-grid`
- **feasibility:** `partial`
- **created:** 2026-08-27T14:10:23.031Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon A job register must filter/sort/page over IndexedDB collections with money and (soon) wall columns. applyInMemory exists but wiring a denormalized JobListItem join (customer name, booking_no, gp_idr) is app-invented every time. A Backseat helper executeBackseatList({ collection, mapRow, grid, scopeFilter }) would match executeDrizzleList so Horizon B is a store swap.

## User story

As a Backseat-first ERP I want the same {items,pageInfo,query} shape from IndexedDB as from Drizzle.

## Proposed behavior

executeBackseatList maps collection records to row objects, applies grid query in memory (including money types), returns the rest list envelope. Optional prefilter for ABAC scope.

## Proposed API

executeBackseatList({ store, collection, toRow, grid, prefilter? })

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Reuse applyInMemory; add backseat adapter docs next to executeDrizzleList
- Example: jobs collection joined in toRow with partners.get

## Risks

- Joins (partner name) stay in toRow; library must not grow an ORM.
- ABAC prefilter must run before paging so page totals are scoped.

## Alternatives

- Load all jobs into memory in the React page (does not scale; also skips RBAC).
- Duplicate executeDrizzleList semantics by hand — Horizon B then rewrites filters.

## Agent handoff

1. Load Intent skills for `@eristack/data-grid`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: ui-job-register. IMPLEMENTATION §12 list jobs, §24 columns.

### Consumer evidence (Tiga Sekawan)

Job register columns need joins: customerName, bookingNo from job_sea, gpIdr from cost sheet, derived invoiced flag.

`executeDrizzleList` is the Horizon B path. Horizon A needs the same `{ items, pageInfo, query }` envelope from IndexedDB or the UI will be rewritten when flipping clients.

applyInMemory exists on data-grid-core; the gap is the Backseat adapter glue + prefilter callback for assignment pairs.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
