# Suggestion: New `@eristack/spreadsheet-operator` package (keyboard nav + active grid scope)

> Portable Eristack ticket — send this file to maintainers. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260929-152500-suggestion-unified-spreadsheet-operator-package-a8f2c1`
- **kind:** suggestion
- **package:** `@eristack/spreadsheet-operator` (proposed **new** package; not an extension of a single existing one)
- **feasibility:** `needs-decision` (new surface area; clear consumer need; boundaries must be agreed with `line-grid`, `data-grid`, `form-ui`)
- **created:** 2026-09-29T08:25:00.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

ERP document UIs increasingly use **in-browser spreadsheet tables** (cost sheets, PO lines, invoice line pickers, header field strips). Today each app copies `<table>` chrome and per-cell `<Input>` / Radix `<Select>` with **no shared focus model**: arrow keys do not move between cells, Enter does not commit-and-advance, Tab escapes inconsistently, and **multiple grids on one screen** fight for keyboard focus. Consumers need a **reusable headless operator + React adapter** that owns **active-grid scope**, **cell coordinates**, **navigation/editing state machine**, and **visual active-cell chrome**—without owning QUPS math, HTTP list queries, or xlsx export.

## User story

As an ERP UI author building a QUPS line table or cost sheet, I want one keyboard model (activate grid → arrow/Tab/Enter/Esc) so power users can edit lines without the mouse, and so two sell/buy grids on the same page do not steal keys from each other.

## Consumer assessment (Tiga Sekawan, 2026-09)

### What exists in the app today

| Layer | Location | Role |
| --- | --- | --- |
| Spreadsheet **chrome** | `apps/web/src/components/spreadsheet-grid.tsx` | Borders, cell kinds (`input` / `select` / `derived` / `readonly`), legend, `SpreadsheetValue` |
| Line **editors** | `cost-sheet-grid.tsx`, `purchase-order-form.tsx`, `invoice-draft-editor.tsx`, `invoice-cost-sheet-line-picker.tsx` | Native inputs + shadcn/Radix selects inside `<td>`; commit via TanStack Query mutations or TanStack Form |
| QUPS **math** | `@eristack/qups`, `qupsRolesFor`, domain `patchLine` / `applyLinePatch` | Which fields are editable vs derived; not navigation |
| Register **lists** | `@eristack/data-grid` + `register-grid` | Remote sort/filter/page; **not** in-cell spreadsheet editing |
| Export | `@eristack/spreadsheet-render` | Download xlsx/csv; **no** interaction |
| Planned alignment | `@eristack/line-grid` (dependency declared; wave-13 migration) | QUPS column catalog + form-ui cells; **no** evidence of Excel-like operator in v0.1.0 catalog |

### Gaps relative to the four requirements

1. **Spreadsheet-like activity (keyboard, Enter, etc.)** — Each cell is an independent focusable control. Enter submits forms or inserts newlines in inputs; there is no document-level **commit → move down** or **Enter to start editing** on the active cell.
2. **Isolate activity in the active table** — Multiple `SpreadsheetGrid` instances (sell + buy cost sheet, PO lines + header strip) share one document tab with no **single active grid** contract.
3. **Active state + indicator** — `data-spreadsheet-cell` marks kind for styling only. No **active cell** ring/border, no roving `tabIndex`, no `aria-activedescendant` / grid ARIA pattern.
4. **Reduce mouse** — Users must click into every input/select. No **type-to-edit** on active read-only-looking cell, no Shift+Arrow selection (optional later).

### Why not bolt this onto an existing package?

| Package | Why it is the wrong owner |
| --- | --- |
| `@eristack/qups` | Pure line math; must stay DOM-free (see sibling ticket on `applyCellPatch`). |
| `@eristack/data-grid` | HTTP/SQL list query + filter builder; different UX (register vs document lines). |
| `@eristack/spreadsheet-render` | File generation only; name collision if behavior were added here. |
| `@eristack/line-grid` | Right **consumer** of this package for QUPS columns, but too narrow if operator only lives inside line-grid—invoice pickers, FX strips, and non-QUPS grids would duplicate or fork. |
| `@eristack/form-ui` | Field widgets (money, timestamp); should **register** as cell editors, not own grid navigation. |

**Recommendation:** ship **`@eristack/spreadsheet-operator`** as a focused interaction layer; let **`line-grid`** compose it for QUPS document lines.

---

## Proposed package: `@eristack/spreadsheet-operator`

Single unified product with the same layering pattern as `data-grid` and `money`:

| Export | Responsibility |
| --- | --- |
| `@eristack/spreadsheet-operator` | Headless state machine, keymap, coordinate math, policies |
| `@eristack/spreadsheet-operator/react` | Providers, hooks, optional unstyled table primitives, ARIA wiring |

Optional later: `@eristack/spreadsheet-operator/react/presets` for design-system tokens (peer `@eristack/design-system`), keeping core usable headless in tests.

### 1. Core concepts (headless)

```ts
/** Stable id when multiple grids share one view (e.g. "cost-sheet-sell", "cost-sheet-buy"). */
type GridId = string;

type CellAddress = { row: number; col: number };

type CellNavKind =
  | "editable"   // enter edit on Enter/F2/type
  | "select"     // Enter opens listbox; arrows may move when not editing
  | "display"    // skip or pass-through per policy
  | "readonly";  // focusable for copy/nav but not edit

type SpreadsheetOperatorState =
  | { mode: "inactive" }
  | { mode: "active"; gridId: GridId; address: CellAddress }
  | { mode: "editing"; gridId: GridId; address: CellAddress };

type GridDescriptor = {
  id: GridId;
  rowCount: number;
  colCount: number;
  /** Return nav kind per cell; may vary per row (QUPS derived columns). */
  cellAt: (address: CellAddress) => { kind: CellNavKind; id?: string };
};
```

**Scope rule (requirement 2):** At most one `gridId` is **active** per `SpreadsheetScope` (default: one scope per document tab / modal). Clicks or explicit “focus grid” activate; Escape from inactive chrome deactivates. Arrow keys apply **only** when `mode !== "inactive"` and event target is inside that grid **or** scope has delegated capture.

**State machine (requirement 1):**

| Key / action | inactive | active | editing |
| --- | --- | --- | --- |
| Click cell in grid | → active @ cell | move active | policy: commit or stay |
| Arrow keys | — | move active (skip non-navigable per policy) | optional: caret vs leave cell (config) |
| Tab / Shift+Tab | — | next/prev **editable** cell (wrap policy) | commit → move |
| Enter | — | → editing (or open select) | commit → move down (Excel default) |
| Escape | — | → inactive OR clear active | → active (cancel edit) |
| Type character | — | → editing + replace (optional) | insert |
| F2 | — | → editing | — |

Expose `createSpreadsheetOperator(scopeConfig)` and pure reducers for unit tests (no React).

### 2. React adapter (requirement 3 — active indicator)

- **`SpreadsheetScopeProvider`** — holds operator instance, active `gridId`, subscribes to window keydown when scope is focused.
- **`useSpreadsheetGrid(descriptor)`** — returns `{ props, activeAddress, editing, handlers }` to spread on `<table>` / wrapper.
- **`SpreadsheetNavCell`** — wraps cell content; applies `data-active`, `data-editing`, `aria-selected`, focus ring classes (tokens overridable).
- **Active grid chrome** — when `gridId` is active: `outline` / `ring` on table container (subtle) + stronger ring on active cell (requirement 3 “border or some shit”).
- **`useSpreadsheetCellEditor(ref, { onCommit, onCancel })`** — bridge for `<input>`, `@eristack/form-ui` money fields, Radix Select: on mount in editing mode, focus; on blur policy configurable (commit vs revert).

**Accessibility:** Implement **grid** pattern where feasible (`role="grid"`, `role="gridcell"`, roving `tabIndex={0}` on active cell only). Document limitations for composite widgets (Select).

### 3. Integration contracts (reusability)

| Peer | Contract |
| --- | --- |
| `@eristack/qups` | App calls `patchLine` / `applyCellPatch` on **commit**; operator emits `{ address, fieldKey, value, phase: "commit" }` only—no float math. |
| `@eristack/form-ui` / shadcn | Editors implement `SpreadsheetCellEditor` interface (focus, selectAll, readValue, writeValue). |
| `@eristack/line-grid` | Line-grid renders columns from QUPS profile; internally uses `useSpreadsheetGrid` + column `fieldKey` map. |
| `@eristack/data-grid` | **No merge.** Registers may link to documents; optional future `handoff` event to open doc with operator scope. |

### 4. Non-goals (keep package small)

- Row virtualization (consumer may use TanStack Virtual separately).
- Undo/redo stack (app or future package).
- Multi-cell drag selection (phase 2).
- Server persistence, optimistic locking, epoch (app/domain).
- Replacing `spreadsheet-grid.tsx` visual design in Tiga Sekawan—that stays app or `design-system` preset.

### 5. Success criteria for v0.1

- Headless tests: arrow navigation skips `readonly`/`display`, Tab wraps editable cells, Enter commit moves down.
- React example: two grids on one page; typing in sell grid does not move buy grid until clicked.
- One QUPS example with `line-grid` or minimal 3×3 demo in `examples/react`.
- Intent skills: `spreadsheet-operator-core`, `spreadsheet-operator-adapters`.

## Feasibility rationale

**`needs-decision`** because Eristack must choose:

1. **Package name** — `spreadsheet-operator` vs folding into `line-grid` v0.2 (risk: non-QUPS grids fork the operator).
2. **Select/combobox semantics** — Radix Select inside cells is the hardest part; v0.1 may ship input-like cells + documented Select bridge.
3. **Relationship to TanStack Table** — optional internal use vs stay table-agnostic (descriptor only).

Consumer demand is **real and repeated** across PO, cost sheet, and invoice UIs; math and list packages are already split correctly.

## Implementation sketch (maintainers)

1. **Phase A — core** — `createSpreadsheetOperator`, default Excel-like keymap, `getNextEditableAddress`, scope isolation.
2. **Phase B — react** — Provider, `useSpreadsheetGrid`, nav cell wrapper, container active outline.
3. **Phase C — editor bridge** — native text input + one composite (Select) reference implementation.
4. **Phase D — compose** — `line-grid` adopts operator; document in `ui-package-stack` recipe and `package-relationships`.
5. **Changeset 0.x**, peers `react ^19`, `@eristack/design-system` optional.

## Risks

- Fighting browser defaults inside Radix/shadcn overlays (keydown propagation, portal focus).
- TanStack Form field names vs `(row,col)` — map via column `fieldKey` in app, not in operator.
- Accessibility audit for grid + combobox nesting.

## Alternatives

| Alternative | Tradeoff |
| --- | --- |
| App-only hook in Tiga Sekawan | Fast locally; every ERP fork repeats; violates Eristack “consumers must not reinvent exports”. |
| Extend `@eristack/data-grid/react` | Wrong abstraction; encourages conflating register lists with document line editing. |
| Buy AG Grid / Handsontable | License, bundle size, harder QUPS/form-ui integration. |
| TanStack Table keyboard features | Still need active-grid scope across **multiple** tables and ERP-specific edit/commit rules. |

## Agent handoff

1. Load `@eristack/ai-knowledge#ui-package-stack` and `#package-relationships`.
2. ADR: new package vs `line-grid` embed; record in business-libs.
3. Implement headless-first with vitest; React adapter second.
4. `pnpm knowledge:sync` + Intent skills + `examples/react` spreadsheet demo.
5. Changeset for new package 0.1.0.

## Notes

### Mapping to reporter requirements

| # | Requirement | Spec owner |
| --- | --- | --- |
| 1 | Keyboard, Enter, spreadsheet activity | Core keymap + editing state machine |
| 2 | Isolate activity in active table | `SpreadsheetScope` + single active `gridId` |
| 3 | Active state + visual indicator | React nav cell + container ring |
| 4 | Reduce mouse | Active-first navigation; click optional after scope engaged |

### Consumer evidence paths (Tiga Sekawan)

- `apps/web/src/components/spreadsheet-grid.tsx` — presentational only.
- `apps/web/src/features/jobs/cost-sheet-grid.tsx` — dual grids, ~10 columns, Select + decimal inputs.
- `apps/web/src/features/purchase-orders/purchase-order-form.tsx` — QUPS truth-derived columns.
- `apps/web/src/features/invoices/invoice-cost-sheet-line-picker.tsx` — read-mostly grid (checkbox column; different nav policy).

**Explicit consumer commitment:** Tiga Sekawan will **not** implement operator logic locally first; waiting on `@eristack/spreadsheet-operator` (or maintainer counter-proposal with same boundaries) before migrating grids.

### Sibling tickets

- `20260827-141023-suggestion-react-patchline-on-commit-helpers-for-spreadshee-b0979b.md` (`@eristack/qups` commit helper — composes on **commit** events from this operator).
- `.eristack/knowledge/wave13-party-platform-ui.md` — `line-grid` migration should list spreadsheet-operator as dependency.
