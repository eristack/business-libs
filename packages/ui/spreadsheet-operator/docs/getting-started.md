---
title: Getting started
description: Wire Excel-like keyboard navigation into React tables — descriptors, the state machine, commit → QUPS patchLine, custom cell editors, div grids, styling, gotchas, and headless tests.
---

# Getting started

`@eristack/spreadsheet-operator` owns **one active grid per scope**, the **active cell address**, and the **inactive → active → editing** keyboard machine. It emits `commit` / `cancel` / `startEdit` effects; your app owns cell values, QUPS math, persistence, and table chrome.

Load `@eristack/spreadsheet-operator#spreadsheet-operator-core` (headless rules) and `#spreadsheet-operator-adapters` (React imports). Both point at this page.

## Install

```bash
pnpm add @eristack/spreadsheet-operator react
```

| Import | Contents |
| --- | --- |
| `@eristack/spreadsheet-operator` | `createSpreadsheetOperator`, `reduceOperator`, `keyEventToAction`, `getNextEditableAddress`, address helpers, all types. No React import. |
| `@eristack/spreadsheet-operator/react` | `SpreadsheetScopeProvider`, `SpreadsheetTable`, `SpreadsheetNavCell`, `SpreadsheetTextCell`, `useSpreadsheetGrid`, `SpreadsheetGridIdProvider`, `useSpreadsheetCellEditor`, `useSpreadsheetScope`. |

Peer `react@^18 || ^19` is optional (core only needs none). ESM + CJS, TypeScript types included.

## 1. Describe the grid

The operator never sees your rows. It sees a `GridDescriptor`:

```ts
import type { GridDescriptor } from "@eristack/spreadsheet-operator";

const lines: GridDescriptor = {
  id: "lines",            // unique per SpreadsheetScopeProvider
  rowCount: rows.length,
  colCount: 5,
  cellAt: ({ row, col }) => {
    const field = (["description", "quantity", "unitPrice", "subtotal", "total"] as const)[col];
    // Derived QUPS columns are visible but not navigable.
    if (field === "subtotal" || field === "total") return { kind: "display", fieldKey: field };
    return { kind: "editable", fieldKey: field };
  },
};
```

| `kind` | Arrows / Tab land here | Enter / F2 / typing edits | Typical use |
| --- | --- | --- | --- |
| `editable` | yes | yes | text, money, percent inputs |
| `select` | yes | yes (app opens its listbox on `startEdit`) | UoM, tax code, status |
| `display` | **no** | no | derived totals, computed columns |
| `readonly` | **no** | no | locked cells on a posted document |

Override with `navigableKinds` / `editableKinds` in the config if, say, read-only cells should still be arrow-reachable.

`fieldKey` is echoed on every `commit` effect, so the app can route the value without a column lookup. If you omit it, `id` is used; otherwise it is `undefined`.

Keep the descriptor stable (`useMemo` on `rows.length`); `useSpreadsheetGrid` re-registers it on every render, so changing `rowCount` is picked up immediately.

## 2. Mount the React adapter

```tsx
import { useMemo, useState } from "react";
import type { GridDescriptor } from "@eristack/spreadsheet-operator";
import {
  SpreadsheetNavCell,
  SpreadsheetScopeProvider,
  SpreadsheetTable,
  SpreadsheetTextCell,
} from "@eristack/spreadsheet-operator/react";

function CostSheet() {
  const [sell, setSell] = useState<string[][]>([["", ""], ["", ""]]);
  const [buy, setBuy] = useState<string[][]>([["", ""], ["", ""]]);

  return (
    <SpreadsheetScopeProvider
      onCommit={(e) => console.debug(e.gridId, e.address, e.fieldKey, e.value)}
    >
      <Sheet id="sell" cells={sell} onCells={setSell} />
      <Sheet id="buy" cells={buy} onCells={setBuy} />
    </SpreadsheetScopeProvider>
  );
}

function Sheet({ id, cells, onCells }: { id: string; cells: string[][]; onCells: (c: string[][]) => void }) {
  const descriptor = useMemo<GridDescriptor>(
    () => ({ id, rowCount: cells.length, colCount: 2, cellAt: () => ({ kind: "editable" }) }),
    [id, cells.length],
  );
  return (
    <SpreadsheetTable descriptor={descriptor} className="sheet">
      <tbody>
        {cells.map((row, r) => (
          <tr key={r}>
            {row.map((value, c) => (
              <SpreadsheetNavCell key={c} address={{ row: r, col: c }}>
                <SpreadsheetTextCell
                  address={{ row: r, col: c }}
                  value={value}
                  onCommit={(next) =>
                    onCells(cells.map((line, i) => (i === r ? line.map((v, j) => (j === c ? next : v)) : line)))
                  }
                />
              </SpreadsheetNavCell>
            ))}
          </tr>
        ))}
      </tbody>
    </SpreadsheetTable>
  );
}
```

Two tables share one provider, so exactly one `gridId` is active at a time. Arrow keys in *sell* never move *buy*; clicking *buy* hands over the operator (committing any in-progress edit first).

What the provider does:

- Creates one `createSpreadsheetOperator(config)` and exposes it via `useSpreadsheetScope()`.
- Listens to `keydown` on `window` while a grid is active and calls `preventDefault()` when the operator consumed the key. Keys typed into an `input` / `textarea` / `select` / `contenteditable` **outside** the active grid are left alone.
- Listens to `pointerdown` on `document`; a click outside every `[data-spreadsheet-grid]` commits any edit and deactivates (`deactivateOnOutsidePointerDown={false}` to opt out).
- Runs effects against registered cell editors: `commit` → `editor.readValue()` → `editor.onCommit(value)` + provider `onCommit(event)`; `cancel` → `editor.onCancel()`; `startEdit` with a seed → `editor.writeValue(seed)`.

## 3. The state machine

| Key | `inactive` | `active` | `editing` |
| --- | --- | --- | --- |
| Click a cell | → active | move active cell | commit, then active on the clicked cell |
| Click outside all grids | — | → inactive | commit → inactive |
| Arrow | ignored | next **navigable** cell in that direction (stop at edge by default) | caret moves inside the input (`arrowInEdit: "caret"`); `"leave"` commits and moves |
| Tab / Shift+Tab | ignored | next / prev navigable cell in raster order, **wrap** | commit → move |
| Enter | ignored | start editing (if cell is editable) | commit → move **down** (`enterMove`) |
| Escape | ignored | → inactive | cancel → active (value restored by the editor) |
| Printable character | ignored | start editing **seeded** with that character | goes to the input |
| F2 | ignored | start editing (select all) | — |
| Ctrl / Cmd / Alt combos, IME composition | ignored | ignored | ignored |

Config (`createSpreadsheetOperator(config)` or `<SpreadsheetScopeProvider config={…}>`):

| Option | Default | Values |
| --- | --- | --- |
| `wrap` (Tab) | `"wrap"` | `"wrap"` \| `"stop"` |
| `arrowWrap` | `"stop"` | `"wrap"` \| `"stop"` |
| `enterMove` | `"down"` | `"down"` \| `"right"` \| `"none"` |
| `typeToEdit` | `true` | boolean |
| `arrowInEdit` | `"caret"` | `"caret"` \| `"leave"` |
| `navigableKinds` | `["editable", "select"]` | `CellNavKind[]` |
| `editableKinds` | `["editable", "select"]` | `CellNavKind[]` |

Navigation is raster order (row-major). If an arrow finds no navigable cell before the edge and `arrowWrap` is `"stop"`, the active cell does not move.

## 4. Commit → QUPS (no float math here)

```tsx
import { useLineGridRecalc } from "@eristack/line-grid";

const { line, applyPatch } = useLineGridRecalc({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "1",
  unitPrice: "0",
});

<SpreadsheetScopeProvider
  onCommit={(event) => {
    if (event.fieldKey === "quantity" || event.fieldKey === "unitPrice") {
      applyPatch({ [event.fieldKey]: event.value }); // qups patchLine, strings in/out
    }
  }}
>
```

Server-side, insert with the same `calculateLine` / `withQupsColumns` so form and API agree. Persist with the document's `expectedVersion` (see `@eristack/ai-knowledge#optimistic-document-version`).

## 5. Custom cell editors

`SpreadsheetTextCell` is the reference editor: a `<span data-spreadsheet-display>` while idle, an uncontrolled `<input data-spreadsheet-editor>` while editing, `onBlur` → commit. To use `@eristack/form-ui` `MoneyInput`, a Radix Select, or a date picker, implement `SpreadsheetCellEditor` via the hook:

```tsx
import { useRef } from "react";
import { MoneyInput } from "@eristack/form-ui";
import type { CellAddress } from "@eristack/spreadsheet-operator";
import { useSpreadsheetCellEditor } from "@eristack/spreadsheet-operator/react";

type Props = { address: CellAddress; amount: string; currency: string; onCommit: (amount: string) => void };

function MoneyCell({ address, amount, currency, onCommit }: Props) {
  const draft = useRef(amount);
  const { editing, seed } = useSpreadsheetCellEditor({
    address,
    readValue: () => draft.current,                   // what `commit` reports
    writeValue: (s) => { draft.current = s; },        // type-to-edit seed
    onCommit,
    onCancel: () => { draft.current = amount; },
  });

  if (!editing) return <span data-spreadsheet-display>{amount}</span>;
  return (
    <MoneyInput
      autoFocus
      amount={seed ?? amount}
      currency={currency}
      onAmountChange={(s) => { draft.current = s; }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== "Tab" && e.key !== "Escape") e.stopPropagation();
      }}
    />
  );
}
```

`focus` / `selectAll` are optional editor members for editors that manage their own focus; `SpreadsheetTextCell` uses them, `autoFocus` is enough here.

Rules for editors:

- Let **Enter / Tab / Escape** bubble to `window` — the operator handles them. Stop propagation for everything else so type-to-edit does not re-trigger.
- **Select / combobox:** on `editing === true`, open your listbox and keep arrows inside it (the default `arrowInEdit: "caret"` already leaves arrows to the input). Commit the chosen value on close. This package does not ship a Select.
- The editor's `readValue()` is what `commit` reports — keep a ref to the draft rather than reading React state that may not have flushed.

## 6. Div grids and TanStack Table

`SpreadsheetTable` renders a `<table>`. For divs or a TanStack Table shell, use the hook plus the grid-id provider:

```tsx
import { SpreadsheetGridIdProvider, useSpreadsheetGrid } from "@eristack/spreadsheet-operator/react";

function DivGrid({ descriptor, children }) {
  const { gridProps, activeAddress, editing, isGridActive } = useSpreadsheetGrid(descriptor);
  return (
    <SpreadsheetGridIdProvider gridId={descriptor.id}>
      <div {...gridProps} className="grid">{children}</div>
    </SpreadsheetGridIdProvider>
  );
}
```

Cells must carry `data-spreadsheet-cell`, `data-row`, `data-col` for click-to-activate (`SpreadsheetNavCell` adds these but renders a `<td>`; for divs, copy the attributes onto your own element and use `useSpreadsheetCellEditor` for editing).

## 7. Styling

No CSS ships. Hook on data attributes:

| Attribute | Element | Meaning |
| --- | --- | --- |
| `[data-spreadsheet-grid="<id>"]` | table / container | Registered grid |
| `[data-spreadsheet-active]` | table / container | This grid owns the operator |
| `[data-spreadsheet-cell][data-active]` + `aria-selected="true"` | cell | Active cell (also `tabIndex=0`; all others `-1`) |
| `[data-editing]` | cell | Cell is in edit mode |
| `[data-spreadsheet-display]` / `[data-spreadsheet-editor]` | inside cell | `SpreadsheetTextCell` idle / editing element |

```css
[data-spreadsheet-active] {
  outline: 2px solid hsl(var(--erista-color-primary));
  outline-offset: 2px;
}
[data-spreadsheet-cell][data-active] {
  box-shadow: inset 0 0 0 2px hsl(var(--erista-color-primary));
}
[data-spreadsheet-cell][data-editing] input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
}
```

## Production path

1. One `SpreadsheetScopeProvider` per document tab or modal (pair with `@eristack/multitab` / `@eristack/doc-shell`).
2. Memoize `GridDescriptor`; return `kind: "display"` for derived QUPS columns and `kind: "readonly"` when the document is locked.
3. `onCommit` → `applyPatch` / `patchLine` → save strings with `expectedVersion`; the server recomputes with the same `calculateLine`.
4. Cell editors from `@eristack/form-ui`; table chrome and columns from `@eristack/line-grid` or your own table.
5. Export with `@eristack/spreadsheet-render` — a different package.

Demo: `examples/react` → `SpreadsheetOperatorDemo` (two grids, no login).

## Gotchas

- **Nothing happens on keys** — the operator is `inactive` until a cell is clicked (or you `dispatch({ type: "activate", gridId, address })`). Keys never activate a grid.
- **Enter did not start editing** — the cell's `kind` is `display` / `readonly`, or your editor stopped the `Enter` keydown from reaching `window`.
- **Typing in a header field is swallowed** — only if that field is inside the active grid's element. Fields outside are ignored by design; if you nest unrelated inputs inside a `<SpreadsheetTable>`, move them out.
- **Escape once vs twice** — while editing, Escape cancels; a second Escape deactivates the grid.
- **Commit fires with an empty string** — no editor was registered for that cell (`useSpreadsheetCellEditor` not mounted) so `readValue()` fell back to `""`.
- **`useSpreadsheetGridId must be used within …`** — you used `useSpreadsheetGrid` on a custom container without `SpreadsheetGridIdProvider`.
- **Two providers, one page** — keys only reach the provider whose grid is active; if two providers both have an active grid, both react. Use one provider per screen.
- **SSR** — the provider renders fine server-side (`inactive`); listeners attach in `useEffect`.

## Testing

The core is a pure machine — test it in Node without React or a DOM:

```ts
import { createSpreadsheetOperator, getNextEditableAddress } from "@eristack/spreadsheet-operator";

const op = createSpreadsheetOperator();
op.registerGrid({ id: "g", rowCount: 2, colCount: 2, cellAt: () => ({ kind: "editable", fieldKey: "qty" }) });

op.dispatch({ type: "activate", gridId: "g", address: { row: 0, col: 0 } });
op.handleKeyDown({ key: "Enter" }); // → editing, effect startEdit
op.handleKeyDown({ key: "Enter" }); // → active at row 1, effect commit { fieldKey: "qty" }; returns true (consumed)

expect(op.getState()).toEqual({ mode: "active", gridId: "g", address: { row: 1, col: 0 } });
expect(getNextEditableAddress(op.getGrid("g")!, { row: 1, col: 1 }, "next")).toEqual({ row: 0, col: 0 }); // wraps
```

`dispatch()` returns `{ state, effects }` synchronously; `subscribe(listener)` receives the same pair after every change. React components render with `renderToStaticMarkup` for smoke tests (`role="grid"`, `role="gridcell"`, `data-spreadsheet-grid`).

## Exports

**Core (`@eristack/spreadsheet-operator`):** `createSpreadsheetOperator`, `reduceOperator`, `keyEventToAction`, `resolveConfig`, `getNextEditableAddress`, `moveActiveAddress`, `tabActiveAddress`, `listNavigableAddresses`, `isNavigable`, `isEditable`, `isKind`, `kindAt`, `sameAddress`, `addressKey`, `cellKey`, `inBounds`, `clampAddress`, `compareRaster`, `DEFAULT_NAVIGABLE_KINDS`, `DEFAULT_EDITABLE_KINDS`; types `GridDescriptor`, `CellDescriptor`, `CellAddress`, `CellNavKind`, `SpreadsheetOperator`, `SpreadsheetOperatorConfig`, `SpreadsheetOperatorState`, `OperatorAction`, `OperatorEffect`, `OperatorKeyEvent`, `SpreadsheetCommitEvent`, `WrapPolicy`, `EnterMove`, `ArrowInEdit`, `MoveDirection`, `TabDirection`, `NavDirection`.

**React (`@eristack/spreadsheet-operator/react`):** `SpreadsheetScopeProvider`, `SpreadsheetTable`, `SpreadsheetNavCell`, `SpreadsheetTextCell`, `SpreadsheetGridIdProvider`, `useSpreadsheetGrid`, `useSpreadsheetCellEditor`, `useSpreadsheetScope`, `useSpreadsheetGridId`, `isKeyTargetOutsideActiveGrid`, `isPointerTargetOutsideGrids`; types `SpreadsheetCellEditor`, `SpreadsheetScopeApi`, `SpreadsheetScopeProviderProps`, `SpreadsheetTableProps`, `SpreadsheetNavCellProps`, `SpreadsheetTextCellProps`, `SpreadsheetGridIdProviderProps`, `UseSpreadsheetGridResult`, `UseSpreadsheetCellEditorOptions`, `KeyTargetLike`.
