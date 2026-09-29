---
name: spreadsheet-operator-adapters
description: >
  @eristack/spreadsheet-operator/react: SpreadsheetScopeProvider { config, onCommit({ gridId, address, fieldKey, value }),
  deactivateOnOutsidePointerDown } (window keydown + outside click deactivate), SpreadsheetTable { descriptor } (role grid),
  SpreadsheetNavCell { address } (role gridcell, data-active / data-editing / aria-selected, roving tabIndex),
  SpreadsheetTextCell { address, value, onCommit }, useSpreadsheetGrid + SpreadsheetGridIdProvider for div grids,
  useSpreadsheetCellEditor({ address, readValue, writeValue, onCommit, onCancel }) to bridge form-ui MoneyInput or a Select.
  Style via data-spreadsheet-active / data-active; no CSS ships. Use when wiring keyboard grids in React ERP screens.
metadata:
  type: adapter
  library: "@eristack/spreadsheet-operator"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/ui/spreadsheet-operator/docs/getting-started.md"
---

# Spreadsheet operator — React

```tsx
import type { GridDescriptor } from "@eristack/spreadsheet-operator";
import {
  SpreadsheetNavCell, SpreadsheetScopeProvider, SpreadsheetTable, SpreadsheetTextCell,
} from "@eristack/spreadsheet-operator/react";

const grid = useMemo<GridDescriptor>(
  () => ({ id: "lines", rowCount: rows.length, colCount: 2, cellAt: ({ col }) => ({ kind: "editable", fieldKey: col ? "unitPrice" : "quantity" }) }),
  [rows.length],
);

<SpreadsheetScopeProvider onCommit={(e) => applyPatch({ [e.fieldKey!]: e.value })}>
  <SpreadsheetTable descriptor={grid}>
    <tbody>
      {rows.map((row, r) => (
        <tr key={row.id}>
          {(["quantity", "unitPrice"] as const).map((f, c) => (
            <SpreadsheetNavCell key={f} address={{ row: r, col: c }}>
              <SpreadsheetTextCell address={{ row: r, col: c }} value={row[f]} onCommit={(v) => update(row.id, f, v)} />
            </SpreadsheetNavCell>
          ))}
        </tr>
      ))}
    </tbody>
  </SpreadsheetTable>
</SpreadsheetScopeProvider>
```

| Export | Role |
| --- | --- |
| `SpreadsheetScopeProvider { config?, onCommit?, deactivateOnOutsidePointerDown? = true }` | One operator per document tab; window `keydown` while a grid is active (skips inputs outside the active grid); `pointerdown` outside all grids commits + deactivates |
| `SpreadsheetTable { descriptor, className? }` | `<table role="grid" data-spreadsheet-grid data-spreadsheet-active?>` + click-to-activate + grid id context |
| `SpreadsheetNavCell { address }` | `<td role="gridcell" data-spreadsheet-cell data-row data-col data-active? data-editing? aria-selected tabIndex>` |
| `SpreadsheetTextCell { address, value, onCommit }` | `<span data-spreadsheet-display>` → uncontrolled `<input data-spreadsheet-editor>`; blur commits |
| `useSpreadsheetGrid(descriptor)` → `{ gridProps, activeAddress, editing, isGridActive }` | Spread `gridProps` on a div / TanStack Table container; wrap children in `SpreadsheetGridIdProvider { gridId }` |
| `useSpreadsheetCellEditor({ address, readValue, writeValue?, onCommit?, onCancel?, focus?, selectAll? })` → `{ editing, seed }` | Register any editor (form-ui `MoneyInput`, Radix Select, date picker) |
| `useSpreadsheetScope()` → `{ operator, state, registerEditor }` | Toolbars, status bars, programmatic `operator.dispatch` |

## Checklist

1. One provider per screen/tab; every `SpreadsheetTable` inside gets a unique `descriptor.id`.
2. Memoize the descriptor on `rows.length`; derived columns `kind: "display"`.
3. Custom editors: let **Enter / Tab / Escape** bubble; `stopPropagation()` on other keys; keep the draft in a ref and return it from `readValue()`.
4. Select cells: open the listbox when `editing` flips true; commit on close. This package ships no Select.
5. CSS: `[data-spreadsheet-active] { outline: 2px solid hsl(var(--erista-color-primary)) }` and `[data-spreadsheet-cell][data-active] { box-shadow: inset 0 0 0 2px … }`.
6. Div grids: `useSpreadsheetGrid` + `SpreadsheetGridIdProvider`; cells need `data-spreadsheet-cell`, `data-row`, `data-col`.

## Do not

- Nest unrelated inputs inside a `SpreadsheetTable` — keys typed there are treated as grid keys.
- Put two providers with simultaneously active grids on one page.
- Compute totals in `onCommit`; hand the string to `@eristack/line-grid` `applyPatch` / `@eristack/qups` `patchLine`.

Demo: `examples/react` → `SpreadsheetOperatorDemo` (two grids sharing one provider).
