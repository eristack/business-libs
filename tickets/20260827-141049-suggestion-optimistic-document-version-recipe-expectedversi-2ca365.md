# Suggestion: Optimistic document version recipe (expectedVersion) for ERP aggregates

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141049-suggestion-optimistic-document-version-recipe-expectedversi-2ca365`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `partial`
- **created:** 2026-08-27T14:10:49.761Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

IMPLEMENTATION.md uses version integer + UPDATE WHERE version=expected on Job/CostSheet/Invoice. Not an Eristack package. architecture-recommend should tell agents to put expectedVersion on commands instead of inventing etags or locking tables. Optional tiny helper is a later package decision.

## User story

As an agent implementing Horizon B I want a canon pattern for CONFLICT_VERSION 409.

## Proposed behavior

Skill/recipe: aggregates carry version; save returns version_conflict; HTTP 409 CONFLICT_VERSION; Backseat handlers check version too.

## Proposed API

Docs only unless a @eristack/concurrency package is approved (needs-decision for a new package)

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Add a short section to architecture-recommend or stack-defaults
- Example in express+backseat PO/job

## Risks

- Do not create @eristack/concurrency unless maintainers want a new package (needs-decision). This ticket is docs/recipe first.
- Backseat IndexedDB updates must still check version to demo 409.

## Alternatives

- etag/If-Match HTTP only — misses Backseat.
- last-write-wins — two CS users on one cost sheet will clobber rates.

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

IMPLEMENTATION §6.9, §22. Every PATCH in Jobs. Feasibility: knowledge/docs possible; new package needs-decision.

### Consumer evidence (Tiga Sekawan)

Aggregates jobs, cost_sheets, invoices carry `version`. Commands send `expectedVersion`. Save WHERE version = expected; mismatch → CONFLICT_VERSION 409.

Horizon A will fake this in handlers if we remember. Horizon B SQL is easy to get wrong (update without WHERE version).

architecture-recommend should mention expectedVersion next to epoch (they are different: epoch is cache; version is write conflict).

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
