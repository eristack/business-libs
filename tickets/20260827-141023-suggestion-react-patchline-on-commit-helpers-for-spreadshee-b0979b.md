# Suggestion: React patchLine-on-commit helpers for spreadsheet cost-sheet grids

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141023-suggestion-react-patchline-on-commit-helpers-for-spreadshee-b0979b`
- **kind:** suggestion
- **package:** `@eristack/qups`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:23.799Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Tiga Sekawan cost sheet is a spreadsheet grid (copy of PO form). Cell commit must call patchLine with truth roles, not qty*rate. qups/react is thin. A headless applyCellPatch({ line, field, value, currency }) that returns the next line would stop every ERP rewriting applyLinePatch.

## User story

As a cost-sheet UI author I want one function from cell edit to QUPS line so Horizon A mockup and Horizon B API share math.

## Proposed behavior

applyCellPatch maps quantity|unitPrice|subtotal|truth|tax into PatchLineInput, runs patchLine({round:true}), returns CalculatedLine fields. No DOM.

## Proposed API

@eristack/qups/react applyLineFieldPatch or keep in core if no React

## Feasibility rationale

In-bounds for React patchLine-on-commit helpers for spreadsheet cost-sheet grids; proceed with a concrete implementation sketch.

## Implementation sketch

- Prefer core function taking PatchLineInput builder to avoid React in core
- Document with TanStack Form cell commit; chrome stays in the app

## Risks

- No DOM, no spreadsheet component in qups (app owns spreadsheet-grid.tsx).
- discountPercent → modifiers mapping may stay app-specific; helper should accept a mapper or only official PatchLineInput fields.

## Alternatives

- Keep applyLinePatch in packages/domain (current PO). Works but every consumer copies it.
- Recalculate only on the server — cost-sheet UX needs per-cell commit like Excel.

## Agent handoff

1. Load Intent skills for `@eristack/qups`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: ui-cost-sheet. IMPLEMENTATION §23.5 grid; §8.8 truth modes. Copy shape from purchase-orders/line-pricing.ts applyLinePatch.

### Consumer evidence (Tiga Sekawan)

Cost sheet is two stacked grids (sell/buy). Enter commits a cell and must run patchLine. Computed cells read-only via qupsRolesFor.

`applyLinePatch` in domain today maps discountPercent to modifiers then patchLine. Promoting the generic “field name → PatchLineInput” bit to qups would let Horizon A UI and Horizon B API share one import from `@eristack/qups` instead of growing a second applyCostSheetPatch.

Do not ship a DataGrid spreadsheet as part of qups — Tiga Sekawan already has chrome.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
