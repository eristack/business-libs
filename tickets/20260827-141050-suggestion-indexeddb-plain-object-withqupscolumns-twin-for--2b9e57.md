# Suggestion: IndexedDB/plain-object withQupsColumns twin for Backseat lines

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141050-suggestion-indexeddb-plain-object-withqupscolumns-twin-for--2b9e57`
- **kind:** suggestion
- **package:** `@eristack/qups`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:50.189Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

qups/drizzle withQupsColumns is for SQL inserts. Horizon A persists cost_sheet_lines as IndexedDB documents. A withQupsFields(calculated) that returns the same keys as drizzle columns (quantity, unit_price, subtotal, truth, ...) would keep mockup and Postgres column names aligned.

## User story

As a Backseat cost-sheet writer I want one mapper from calculateLine to persistable fields.

## Proposed behavior

withQupsFields(line: CalculatedLine) -> record matching qupsLineColumns names. No Drizzle import.

## Proposed API

withQupsFields in qups-core or qups-line; drizzle withQupsColumns wraps it

## Feasibility rationale

In-bounds for IndexedDB/plain-object withQupsColumns twin for Backseat lines; proceed with a concrete implementation sketch.

## Implementation sketch

- Extract column names to a shared const
- Backseat example writes those keys onto the document

## Risks

- Column names must stay stable with drizzle qupsLineColumns or Horizon B mappers break.
- Do not import drizzle from core.

## Alternatives

- Duplicate field names in the app (what we will do).

## Agent handoff

1. Load Intent skills for `@eristack/qups`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: backseat-cost-sheet persist lines. IMPLEMENTATION §7.0 QUPS columns table.

### Consumer evidence (Tiga Sekawan)

Drizzle path: qupsLineColumns + withQupsColumns(calculateLine).

Backseat path: IndexedDB documents. If keys differ (`unitPrice` vs `unit_price`) Horizon B mappers become a science project.

`withQupsFields(calculated)` in core, drizzle adapter wraps it, Backseat writes the same keys. Truth, tax_mode, quantity, unit_price, subtotal, net, tax_amount, total.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
