# @eristack/spreadsheet-operator

Headless Excel-like keyboard operator for in-browser ERP grids — one active grid per scope, cell coordinates, Enter / Tab / Esc state machine, plus a React adapter (`./react`) with an ARIA `grid` table, roving-tabindex cells, and a native text editor.

```bash
pnpm add @eristack/spreadsheet-operator react
```

- Core: `createSpreadsheetOperator`, `getNextEditableAddress` — no React, testable in Node.
- React: `SpreadsheetScopeProvider`, `SpreadsheetTable`, `SpreadsheetNavCell`, `SpreadsheetTextCell`, `useSpreadsheetCellEditor`.
- Not xlsx export (`@eristack/spreadsheet-render`), not list queries (`@eristack/data-grid`), not QUPS math (`@eristack/qups`).

Docs: [overview](./docs/index.md) · [getting started](./docs/getting-started.md). Agents: `pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-core`.
