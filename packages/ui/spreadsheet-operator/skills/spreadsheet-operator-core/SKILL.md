---
name: spreadsheet-operator-core
description: >
  @eristack/spreadsheet-operator headless Excel-like keyboard machine: createSpreadsheetOperator(config)
  with registerGrid({ id, rowCount, colCount, cellAt → { kind editable|select|display|readonly, fieldKey } }),
  dispatch/handleKeyDown, state inactive → active → editing, effects startEdit/commit { fieldKey }/cancel,
  getNextEditableAddress. Defaults: Tab wraps, arrows stop at edges, Enter edits then commits and moves down,
  type-to-edit, arrows in edit move the caret. Use for in-browser grids with one active grid per scope;
  commit → qups patchLine in the app. Not xlsx export (spreadsheet-render) and not HTTP lists (data-grid).
metadata:
  type: core
  library: "@eristack/spreadsheet-operator"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/ui/spreadsheet-operator/docs/getting-started.md"
---

# Spreadsheet operator — core

Headless keyboard operator for ERP **in-browser** grids (cost sheets, PO lines, pickers). Pure state machine, no React, no values, no math.

```ts
import { createSpreadsheetOperator, getNextEditableAddress } from "@eristack/spreadsheet-operator";

const op = createSpreadsheetOperator({ enterMove: "down" }); // defaults shown below
op.registerGrid({
  id: "lines",
  rowCount: rows.length,
  colCount: 5,
  cellAt: ({ col }) => (col >= 3 ? { kind: "display" } : { kind: "editable", fieldKey: FIELDS[col] }),
});

op.dispatch({ type: "activate", gridId: "lines", address: { row: 0, col: 0 } });
op.handleKeyDown({ key: "Enter" }); // active → editing; effect startEdit
op.handleKeyDown({ key: "Enter" }); // editing → active row+1; effect commit { gridId, address, fieldKey }
op.subscribe((state, effects) => { /* commit → read editor value → patchLine */ });
```

## Contract

| Piece | Shape |
| --- | --- |
| `GridDescriptor` | `{ id, rowCount, colCount, cellAt(address) → { kind, fieldKey?, id? } }` — app renders rows |
| `CellNavKind` | `editable` / `select` navigable + editable; `display` / `readonly` skipped by arrows and Tab |
| State | `{ mode: "inactive" }` \| `{ mode: "active", gridId, address }` \| `{ mode: "editing", gridId, address, seed? }` |
| Effects | `startEdit { seed? }`, `commit { fieldKey?, phase: "commit" }`, `cancel` |
| Keys | Arrow move (stop at edge) · Tab/Shift+Tab raster next/prev (wrap) · Enter edit → commit+down · Esc cancel → then inactive · printable = type-to-edit seed · F2 edit · Ctrl/Cmd/Alt/IME ignored |
| Config | `wrap "wrap"`, `arrowWrap "stop"`, `enterMove "down"|"right"|"none"`, `typeToEdit true`, `arrowInEdit "caret"|"leave"`, `navigableKinds`, `editableKinds` |
| `getNextEditableAddress(grid, from, dir, config?)` | Pure query; `null` when nowhere to go |

## Checklist

1. One operator (or one `SpreadsheetScopeProvider`) per document tab; unique `gridId` per table.
2. Derived QUPS columns → `kind: "display"`; locked documents → `kind: "readonly"`.
3. Put `fieldKey` on editable cells so `commit` can be routed without a column lookup.
4. On `commit`, call `patchLine` / `applyPatch` with strings — never `Number()` in the grid.
5. Test the machine in Node: `dispatch()` returns `{ state, effects }` synchronously.

## Do not

- Re-implement arrow/Tab/Enter logic in the app or inside `@eristack/line-grid`.
- Use this for xlsx/csv (`@eristack/spreadsheet-render`) or server list queries (`@eristack/data-grid`).
- Expect values, undo/redo, drag selection, clipboard ranges, or virtualization here.

React: load `#spreadsheet-operator-adapters`.
