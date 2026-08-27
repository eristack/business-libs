# Suggestion: Resource-in-assignment-pairs helper for Role x Branch x Trade scope

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140918-suggestion-resource-in-assignment-pairs-helper-for-role-x-b-784143`
- **kind:** suggestion
- **package:** `@eristack/abac`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:09:18.046Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Sample Software and Tiga Sekawan bind users to Role x Branch x Trade. ABAC today is generic algorithms. A documented helper inScope({ pairs: {branchId, trade}[], resource }) would stop every ERP rewriting the same allow-iff-exists-assignment predicate.

## User story

As an ERP I want job.in_scope as one attrs helper so list and get share the same policy.

## Proposed behavior

evaluate true iff some assignment pair equals resource.branchId and resource.trade. Admin bypass is NOT in this helper (app policy).

## Proposed API

attrs.assignmentPairMatch({ pairs, branchKey, tradeKey }) or similar

## Feasibility rationale

In-bounds for Resource-in-assignment-pairs helper for Role x Branch x Trade scope; proceed with a concrete implementation sketch.

## Implementation sketch

- Pure function in abac-core attrs helpers
- React/express examples passing pairs from user_access
- Do not hardcode the words branch or trade in the core if keys are configurable

## Risks

- Do not bake admin bypass into the helper.
- Keys must be configurable (branchId/trade vs cabang_id/jenis).

## Alternatives

- Filter only in React sidebar (IMPLEMENTATION forbids this — lists must enforce in the list source).
- Duplicate the predicate in every handler.

## Agent handoff

1. Load Intent skills for `@eristack/abac`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: `2026-08-27-backseat-access-air-land-reporting`. IMPLEMENTATION §10.4 ABAC job.in_scope.

### Consumer evidence (Tiga Sekawan)

Access model is Role × Branch × Trade (PREDEV Sample Software observation, adopted as data not hardcoded).

Policy: ALLOW iff exists assignment A with A.branch_id = job.branch_id AND A.trade = job.trade.

Seed: demo admin has SUB×export|import|domestic; cs1 has SUB×export only. Exit criterion: two trades cannot see each other's jobs.

attrs helper would be used in Backseat list prefilter AND get-by-id.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
