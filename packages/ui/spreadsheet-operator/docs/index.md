---
title: Overview
description: Headless Excel-like keyboard operator for in-browser ERP grids — one active grid per scope, cell coordinates, Enter/Tab/Esc state machine, React adapter.
---

# @eristack/spreadsheet-operator

Keyboard navigation and editing state for tables that should *feel* like a spreadsheet: click a cell, arrow around, press Enter to edit, Enter again to commit and move down, Tab to the next editable cell, Escape to cancel. The core is a pure state machine with no React; `./react` wraps it in a provider, an ARIA `grid` table, roving-tabindex cells, and a native text editor.

It owns **which grid is active**, **which cell is active**, and **whether that cell is being edited**. It does not own values, math, lists, or files.

## Use it when

- A document screen has one or more editable tables (invoice lines, cost sheets, FX strips, pickers) and users expect Excel keys.
- Two tables sit on one page (sell / buy, header / lines) and keys must apply only to the grid the user clicked.
- You want `commit` events with `{ gridId, address, fieldKey, value }` so the app can call `patchLine` or persist — never float math in the grid.
- You need the navigation rules (skip read-only cells, wrap on Tab, stop at edges on arrows) tested once, not re-implemented per screen.

## Not for

- xlsx / csv download — `@eristack/spreadsheet-render`.
- Remote list queries, filters, sorting, paging — `@eristack/data-grid`.
- QUPS quantity / price / subtotal math — `@eristack/qups` via `@eristack/line-grid`.
- Row virtualization, undo/redo, multi-cell drag selection, clipboard ranges, formulas, a Select/combobox implementation, persistence. The app (or a later package) owns these.

## Install

```bash
pnpm add @eristack/spreadsheet-operator react
```

`react@^18 || ^19` is an optional peer — omit it if you only use the headless core (tests, non-React shells). No `@eristack/design-system` peer; style with the data attributes below.

## 30-second example

```tsx
import { useMemo, useState } from "react";
import type { GridDescriptor } from "@eristack/spreadsheet-operator";
import {
  SpreadsheetNavCell,
  SpreadsheetScopeProvider,
  SpreadsheetTable,
  SpreadsheetTextCell,
} from "@eristack/spreadsheet-operator/react";

export function Sheet() {
  const [cells, setCells] = useState([["1", "10"], ["2", "20"]]);
  const grid = useMemo<GridDescriptor>(
    () => ({ id: "lines", rowCount: 2, colCount: 2, cellAt: () => ({ kind: "editable" }) }),
    [],
  );

  return (
    <SpreadsheetScopeProvider>
      <SpreadsheetTable descriptor={grid}>
        <tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {row.map((value, c) => (
                <SpreadsheetNavCell key={c} address={{ row: r, col: c }}>
                  <SpreadsheetTextCell
                    address={{ row: r, col: c }}
                    value={value}
                    onCommit={(next) =>
                      setCells((cur) =>
                        cur.map((line, i) =>
                          i === r ? line.map((cell, j) => (j === c ? next : cell)) : line,
                        ),
                      )
                    }
                  />
                </SpreadsheetNavCell>
              ))}
            </tr>
          ))}
        </tbody>
      </SpreadsheetTable>
    </SpreadsheetScopeProvider>
  );
}
```

Click a cell → arrows move → type `9` starts editing with `9` → Enter commits and moves down → Escape leaves the grid. Clicking outside the table commits and deactivates.

## API at a glance

| Import | Export | Role |
| --- | --- | --- |
| `@eristack/spreadsheet-operator` | `createSpreadsheetOperator(config?)` | Operator: `getState`, `dispatch`, `handleKeyDown`, `registerGrid`, `unregisterGrid`, `subscribe` |
| | `GridDescriptor { id, rowCount, colCount, cellAt(address) → { kind, fieldKey?, id? } }` | What the operator knows about a grid — the app renders rows |
| | `CellNavKind` = `editable` \| `select` \| `display` \| `readonly` | Arrows/Tab skip `display` + `readonly`; Enter/F2/type edit `editable` + `select` |
| | `SpreadsheetOperatorState` | `{ mode: "inactive" }` \| `{ mode: "active", gridId, address }` \| `{ mode: "editing", gridId, address, seed? }` |
| | `OperatorEffect` | `startEdit { seed? }` \| `commit { fieldKey? }` \| `cancel` — emitted on transitions |
| | `getNextEditableAddress(grid, from, "up"\|"down"\|"left"\|"right"\|"next"\|"prev", config?)` | Pure navigation query (`null` when nowhere to go) |
| | `reduceOperator`, `keyEventToAction`, `resolveConfig`, address helpers | Building blocks for custom shells |
| `@eristack/spreadsheet-operator/react` | `SpreadsheetScopeProvider { config?, onCommit?, deactivateOnOutsidePointerDown? }` | One operator per document tab; window keydown + outside-click deactivate |
| | `SpreadsheetTable { descriptor, className? }` | `<table role="grid">` + click-to-activate + grid id context |
| | `SpreadsheetNavCell { address }` | `<td role="gridcell">` with `data-active` / `data-editing` / `aria-selected` / roving `tabIndex` |
| | `SpreadsheetTextCell { address, value, onCommit }` | Display text → native `<input>` while editing |
| | `useSpreadsheetGrid(descriptor)` + `SpreadsheetGridIdProvider` | Non-`<table>` containers (divs, TanStack Table) |
| | `useSpreadsheetCellEditor({ address, readValue, writeValue?, onCommit?, onCancel?, focus?, selectAll? })` | Bridge `@eristack/form-ui` inputs or a Select into the machine |
| | `useSpreadsheetScope()` → `{ operator, state, registerEditor }` | Escape hatch for toolbars / status bars |

Config defaults: Tab **wraps**, arrows **stop** at edges, Enter moves **down** after commit, `typeToEdit: true`, arrows while editing move the **caret** (not the cell).

## Works with

| Package | How |
| --- | --- |
| `@eristack/line-grid` + `@eristack/qups` | On `commit`, call `applyPatch({ [fieldKey]: value })` / `patchLine`; derived columns return `kind: "display"` |
| `@eristack/form-ui` | `MoneyInput` / `PercentInput` as cell editors via `useSpreadsheetCellEditor` |
| `@eristack/doc-shell`, `@eristack/multitab` | One `SpreadsheetScopeProvider` per document tab |
| `@eristack/design-system` | Style `[data-spreadsheet-active]` / `[data-active]` with `--erista-color-primary` |

## For agents

```bash
pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-core
pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-adapters
```

Recipes: `spreadsheet-keyboard-operator`, `erp-ui-shell`. Canonical UI guide: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — state machine table, config, commit → QUPS, custom editors, div grids, styling, gotchas, testing.
