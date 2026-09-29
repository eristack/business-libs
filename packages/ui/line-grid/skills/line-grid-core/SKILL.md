---
name: line-grid-core
description: >
  @eristack/line-grid useLineGridRecalc(CalculateLineInput) → { line: CalculatedLine, applyPatch
  (PatchLineInput → qups patchLine), recalculate } and LineGrid { line, columns {id, header},
  renderCell(id, line) } single-row table with erista-line-grid hook. Use for invoice/PO/job line
  editors with form-ui cells; truth modes quantity+unitPrice | quantity+subtotal | unitPrice+subtotal;
  fields subtotal/net/total (no lineTotal). Same calculateLine on server insert. N lines = N grids
  or own table; keyboard via spreadsheet-operator.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/line-grid"
sources:
  - packages/ui/line-grid/docs/getting-started.md
---

# @eristack/line-grid

React over `@eristack/qups`; math never lives here.

```tsx
const { line, applyPatch } = useLineGridRecalc({ truth: "quantity+unitPrice", currency: "SGD", quantity: "1", unitPrice: "10.00", taxRatePercent: "9", taxMode: "exclusive" });

<LineGrid line={line} columns={[{ id: "quantity", header: "Qty" }, { id: "unitPrice", header: "Unit price" }, { id: "subtotal", header: "Subtotal" }, { id: "total", header: "Total" }]}
  renderCell={(id, l) =>
    id === "quantity" ? <input value={l.quantity} onChange={(e) => applyPatch({ quantity: e.target.value })} /> :
    id === "unitPrice" ? <MoneyInput amount={l.unitPrice} currency={l.currency} onAmountChange={(unitPrice) => applyPatch({ unitPrice })} /> :
    id === "subtotal" ? <MoneyInput amount={l.subtotal} currency={l.currency} onAmountChange={(subtotal) => applyPatch({ subtotal, prefer: "quantity" })} /> :
    l.total} />
```

## Checklist

1. Inputs (truth, quantity, unitPrice/subtotal, modifiers, taxRatePercent/taxMode) are form state; totals derived — submit inputs, not totals.
2. Server: `calculateLine(body.line)` + `withQupsColumns(...)` on insert — identical strings, identical result.
3. Many lines: `CalculatedLine[]` + `patchLine` per index, or one hook per row; document total via `Money.sum`.
4. `""` throws in `patchLine` (`"1."` is fine) — buffer and patch on blur, or catch. Outputs unpadded (`"20"`, `"21.8"`); format at display.
5. Modifiers: `{ kind: "discount"|"surcharge", type: "percent"|"nominal", percent|amount }` → `discountTotal`, `surchargeTotal`, `net`.

## Do not

- Compute qty × price or tax in JSX/SQL.
- Reference `line.lineTotal` — use `subtotal`, `net`, `total`.
- Add arrow-key navigation here (`@eristack/spreadsheet-operator`).
