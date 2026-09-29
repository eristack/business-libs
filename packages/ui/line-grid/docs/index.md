---
title: Overview
description: A single-line QUPS editor table and a recalculation hook that call @eristack/qups calculateLine/patchLine — the same string math the API runs — so quantity, unit price, subtotal, modifiers, and tax stay consistent between form and server.
---

# @eristack/line-grid

Invoice, quotation, and job lines are one **`CalculatedLine`** each: `quantity`, `unitPrice`, `subtotal` (two of them are truth, the third derived), plus discounts/surcharges, `net`, `taxAmount`, `total`. `@eristack/qups` owns that math as pure string functions. `@eristack/line-grid` is the thin React layer over it:

- `useLineGridRecalc(initial)` — keeps one `CalculatedLine` in state and exposes `applyPatch(patch)` → `patchLine` and `recalculate(input)` → `calculateLine`.
- `LineGrid` — a `<table>` with a header row and **one** body row, rendering each column through your `renderCell(columnId, line)`.

The word "grid" is aspirational for v0: one `LineGrid` = one line. A document with N lines renders N hooks + N grids (or one `<table>` you compose from the hook alone). Keyboard navigation between cells is `@eristack/spreadsheet-operator`'s job.

## Use it when

- Building a document-with-lines editor and you want the UI to call the exact `patchLine` the API will call on insert.
- You need `subtotal`-first editing (user types the line total, qty or unit price derives) via truth modes.
- Prototyping a lines section quickly with `@eristack/form-ui` cells.

## Not for

- Read-only line tables — map `CalculatedLine[]` into your table component.
- Multi-row keyboard/spreadsheet behaviour — `@eristack/spreadsheet-operator`.
- Any math — never compute totals in the component; always via `applyPatch`.

## Install

```bash
pnpm add @eristack/line-grid @eristack/qups @eristack/form-ui @eristack/money react
```

Peers: `@eristack/form-ui ^0.1.0`, `@eristack/qups ^0.3.0`, `@eristack/money ^0.3.0`, `react`.

## 30-second example

```tsx
import { LineGrid, useLineGridRecalc } from "@eristack/line-grid";
import { MoneyInput } from "@eristack/form-ui";

const { line, applyPatch } = useLineGridRecalc({ truth: "quantity+unitPrice", currency: "SGD", quantity: "2", unitPrice: "10.00", taxRatePercent: "9" });

<LineGrid
  line={line}
  columns={[{ id: "quantity", header: "Qty" }, { id: "unitPrice", header: "Unit price" }, { id: "subtotal", header: "Subtotal" }, { id: "total", header: "Total" }]}
  renderCell={(id, l) =>
    id === "quantity" ? <input value={l.quantity} onChange={(e) => applyPatch({ quantity: e.target.value })} /> :
    id === "unitPrice" ? <MoneyInput amount={l.unitPrice} currency={l.currency} onAmountChange={(unitPrice) => applyPatch({ unitPrice })} /> :
    l[id as "subtotal" | "total"]
  }
/>
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `useLineGridRecalc` | `(initial: CalculateLineInput) => { line: CalculatedLine; applyPatch(patch: PatchLineInput): void; recalculate(input: CalculateLineInput): void }` | `applyPatch` = `patchLine(current, patch)`; `recalculate` replaces the line. Callbacks are stable. |
| `LineGrid` | `({ line, columns: { id, header }[], renderCell(columnId, line) }) => <table class="erista-line-grid">` | One `<tr>` in `<tbody>`; you decide what each cell shows. |
| `LineGridColumn`, `LineGridProps` | types | |

`CalculateLineInput` / `PatchLineInput` / `CalculatedLine` come from `@eristack/qups`. Key fields on `CalculatedLine`: `truth`, `currency`, `quantity`, `unitPrice`, `subtotal`, `discountTotal`, `surchargeTotal`, `net`, `taxRatePercent`, `taxMode`, `taxAmount`, `total`, `modifiers`, `columns` (Drizzle-ready values for `withQupsColumns`). There is no `lineTotal` — use `total` (after tax) or `net` (before tax).

## Works with

- `@eristack/qups` — truth modes `quantity+unitPrice` | `quantity+subtotal` | `unitPrice+subtotal`; `withQupsColumns` on the server insert.
- `@eristack/form-ui` — `MoneyInput` for `unitPrice`/`subtotal`, `PercentInput` for `taxRatePercent` and percent modifiers.
- `@eristack/doc-shell` — lines live in the body slot.
- `@eristack/spreadsheet-operator` — arrow keys / active cell across many lines.
- `@eristack/money` — display formatting of `total`.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/line-grid#line-grid-core`
- Recipes: `erp-ui-shell`, `line-pricing-qups`. Spine: `@eristack/ai-knowledge#document-lines-erp`.

## Next

- [Getting started](./getting-started.md) — multi-line document state, truth-mode switching, modifiers and tax cells, TanStack Form integration, server insert parity, and CSS.
