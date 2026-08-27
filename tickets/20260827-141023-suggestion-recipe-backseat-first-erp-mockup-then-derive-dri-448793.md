# Suggestion: Recipe: Backseat-first ERP mockup then derive Drizzle/Express

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141023-suggestion-recipe-backseat-first-erp-mockup-then-derive-dri-448793`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:23.509Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Tiga Sekawan IMPLEMENTATION Horizon A/B is the missing recipe. backseat-mock-backend and erp-app-core exist separately. recommend() still scores stock-movement and financial-ledger for a forwarding ERP. Need a recipe that says: UI+Backseat+domain/model first; peek handlers; same ports on Drizzle; do not pull GL/stock unless asked.

## User story

As a consumer agent I want recommend() to route logistics ERP mockups to backseat + qups + money + doc-number + rbac/pbac, not valuations.

## Proposed behavior

New recipe backseat-then-backend or extend backseat-mock-backend with derive-backend steps. Triggers: mockup, indexeddb erp, derive backend, forwarding, job order, cost sheet. Deprioritize stock/GL unless inventory/accounting goals.

## Proposed API

recommend() recipe id + loadPlan skill order: backseat-core, upgrading-eristack, qups-line, then later drizzle adapters

## Feasibility rationale

In-bounds for Recipe: Backseat-first ERP mockup then derive Drizzle/Express; proceed with a concrete implementation sketch.

## Implementation sketch

- Add recipe YAML/JSON in ai-knowledge
- Document Horizon A vs B in architecture-recommend or a dedicated skill
- erp-modules recipe should not auto-include stock-movement for job-cost-sheet products

## Risks

- Must not invent @eristack/feature-job.
- Must not tell agents to skip domain/model math in the mockup.

## Alternatives

- Consumer IMPLEMENTATION.md §4b (what we wrote). Still want this upstream so the next forwarding ERP does not pull valuations.

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Active sprint Backseat sea job. ADR 0004. recommend() currently scores stock-movement 16.4 and financial-ledger 15.6 for this repo.

### Consumer evidence (Tiga Sekawan)

`.eristack/knowledge/recommendations.md` matched erp-modules with qups+stock+pbac+financial-ledger because product goals included inventory and general ledger from the scaffold. PREDEV excludes accounting. IMPLEMENTATION forbids stock/GL in v1.

Recipe should trigger on: mockup, backseat, job order, cost sheet, forwarding, freight, derive backend.

Skill order Horizon A: backseat-core, upgrading-eristack (spine matrix), qups-line, money-amounts, money-ledger, doc-number-core, data-grid-core, rbac, pbac, timestamp, epoch, multitab.

Horizon B: same cores + drizzle/express adapters. Peek Backseat handlers.

This is the missing link between `backseat-mock-backend` (priority 8) and `erp-app-core` (priority 5).

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
