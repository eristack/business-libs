# Suggestion: Derive-backend checklist + SQL list projection recipe

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201508-suggestion-derive-backend-checklist-list-projection-recipe-y5z6a7`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `possible`
- **created:** 2026-09-25T20:15:08.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B consumers need a single checklist: reseed, smoke, mirror routes, express env, when to rebuild SQL register projections vs upsert rows. Tiga Sekawan invented `job_register_rows` / `invoice_register_rows` + `executeDrizzleList` beside `backseat_documents`. Document the pattern in ai-knowledge—not a feature package.

## User story

As an agent implementing derive-backend I want a recipe that says when mirror is “done” and how list indexes relate to document store.

## Proposed behavior

New recipe section (or extend `backseat-then-backend`):

- Canonical JSON in `backseat_documents`.
- Denormalized `*_register_rows` for grids.
- `rebuild*Index` on boot/seed; `upsert*Row` after mutations.
- Maturity ladder: proxy mirror → shared use cases → normalized SQL (optional later).
- Exit criteria: `test:api-mirror` style script.

## Proposed API

Docs + Intent skill only.

## Feasibility rationale

No code required; high leverage for agents.

## Implementation sketch

- Pull from Tiga Sekawan `backend-mirror-complete.md` and recommendations batch.
- Link `executeBackseatList` / `executeDrizzleList` parity.
- upgrading-eristack matrix row.

## Risks

- Over-prescriptive about SQL vs normalized tables—state projections as default for Horizon B phase 1.

## Alternatives

- App-only IMPLEMENTATION.md — does not help other consumers.

## Agent handoff

1. ai-knowledge PR: recipe + `pnpm knowledge:sync`.
2. No Changeset unless published package docs change.

## Notes

Consumer: `.eristack/knowledge/backend-mirror-complete.md`, `packages/db/src/indexes/*`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
