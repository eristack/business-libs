# Suggestion: Wall compare and inclusive date-range helpers for lists

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140852-suggestion-wall-compare-and-inclusive-date-range-helpers-fo-a4385d`
- **kind:** suggestion
- **package:** `@eristack/timestamp`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:08:52.933Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Job register filters ETD/ETA ranges; dashboard is jobs departing this week. Walls are not instants. Consumers need compareWall / wallInRange without parsing local strings as UTC.

## User story

As a data-grid author I want ETD between 2026-09-01 and 2026-09-07 in Asia/Jakarta as wall compare, not Date.

## Proposed behavior

compareWall(a,b) => -1|0|1 same timezone. wallInRange(w, start, end) inclusive. Reject mixed timezones or document conversion.

## Proposed API

compareWall; isWallInRange; maybe startOfWeekWall(zone, instant)

## Feasibility rationale

In-bounds for Wall compare and inclusive date-range helpers for lists; proceed with a concrete implementation sketch.

## Implementation sketch

- Compare Y-M-D tuples when timezone equal
- Export from core; drizzle/data-grid can use later

## Risks

- Mixed-timezone compare should throw, not silently convert.
- Inclusive vs exclusive range must be documented for data-grid filters.

## Alternatives

- Store ETD as ISO instant (wrong: ETD is schedule intent).
- String-compare `YYYY-MM-DD` only works if timezone is shared — helper should enforce that.

## Agent handoff

1. Load Intent skills for `@eristack/timestamp`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: sea-job register columns etd/eta range; later dashboard “departing this week”. IMPLEMENTATION §24 data-grid, §23.2 dashboard.

### Consumer evidence (Tiga Sekawan)

Job register is the spreadsheet: ETD/ETA/ATD/ATA filters. Dashboard card: jobs departing this week (`etd` wall in range).

`compareWall` + `isWallInRange` unblocks data-grid `type: wall` (sibling ticket) and Backseat applyInMemory filters.

Without this, agents will `new Date(etd.local)` and shift a day in US browsers.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
