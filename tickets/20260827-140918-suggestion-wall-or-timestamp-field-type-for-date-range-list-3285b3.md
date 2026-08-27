# Suggestion: Wall or timestamp field type for date-range list filters

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140918-suggestion-wall-or-timestamp-field-type-for-date-range-list-3285b3`
- **kind:** suggestion
- **package:** `@eristack/data-grid`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:09:18.535Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Job register sorts/filters ETD/ETA as walls. money/decimal field types exist so lists do not Number() amounts. Date columns still risk ISO string UTC parsing. A wall/date field type would compare civil dates or TimestampJSON without Date.parse hacks.

## User story

As a job-register author I want type: wall or timestamp on etd so range filters use @eristack/timestamp compare.

## Proposed behavior

Field type wall compares local Y-M-D. timestamp compares instants. applyInMemory and drizzle columnsFromSource honor it.

## Proposed API

type: 'wall' | 'timestamp' | 'instant' on grid field defs

## Feasibility rationale

In-bounds for Wall or timestamp field type for date-range list filters; proceed with a concrete implementation sketch.

## Implementation sketch

- Mirror decimal/money field type work in 0.2.2
- Peer timestamp; do not parse with Date only

## Risks

- Peer dependency on timestamp; do not Date.parse as the only compare.
- SQLite vs Postgres column mapping in drizzle adapter.

## Alternatives

- Store etd as text YYYY-MM-DD and type string (loses timezone).
- type: number on unix days (agents will).

## Agent handoff

1. Load Intent skills for `@eristack/data-grid`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sibling of money/decimal field types (ticket 20260822-112915). Sprint: job register. IMPLEMENTATION §24.

### Consumer evidence (Tiga Sekawan)

data-grid 0.2.2 shipped `type: money|decimal` so lists do not Number() amounts. Job register still needs the same for walls: etd, eta, atd, ata, orderDate, invoiceDate, dueAt.

Without a field type, Horizon A applyInMemory and Horizon B executeDrizzleList will diverge on “is 2026-09-20 inside range”.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
