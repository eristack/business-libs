---
"@eristack/spreadsheet-operator": minor
---

Initial `@eristack/spreadsheet-operator` — headless Excel-like keyboard operator for in-browser ERP grids.

- Core (`@eristack/spreadsheet-operator`): `createSpreadsheetOperator`, `GridDescriptor` with `editable | select | display | readonly` cell kinds, `inactive → active → editing` state machine, `startEdit` / `commit { fieldKey }` / `cancel` effects, `getNextEditableAddress`. Defaults: Tab wraps, arrows stop at edges, Enter edits then commits and moves down, type-to-edit.
- React (`@eristack/spreadsheet-operator/react`): `SpreadsheetScopeProvider` (one active grid per scope; window keydown ignores inputs outside the active grid; pointer-down outside all grids commits and deactivates, `deactivateOnOutsidePointerDown` to opt out), `SpreadsheetTable`, `SpreadsheetNavCell`, `SpreadsheetTextCell`, `useSpreadsheetGrid` + `SpreadsheetGridIdProvider` for div grids, `useSpreadsheetCellEditor` bridge for form-ui / Select editors.

Distinct from `@eristack/spreadsheet-render` (xlsx/csv export) and `@eristack/data-grid` (HTTP list queries).
