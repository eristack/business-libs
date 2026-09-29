---
title: Getting started
description: Build an invoice lines editor with useLineGridRecalc + LineGrid — multiple lines, truth-mode switching, discount and tax cells, document totals with Money.sum, TanStack Form, and the identical patchLine call on the server insert.
---

# Getting started

Line math is **only** in `@eristack/qups` — this package calls `patchLine` via `useLineGridRecalc`. Document spine: `@eristack/ai-knowledge#document-lines-erp`.

## Install

```bash
pnpm add @eristack/line-grid @eristack/qups @eristack/form-ui @eristack/money react
```

Peers: `form-ui@^0.1.0`, `qups@^0.3.0`, `money@^0.3.0`.

## One line

```tsx
import { LineGrid, useLineGridRecalc } from "@eristack/line-grid";
import { MoneyInput, PercentInput } from "@eristack/form-ui";

const columns = [
  { id: "quantity", header: "Qty" },
  { id: "unitPrice", header: "Unit price" },
  { id: "subtotal", header: "Subtotal" },
  { id: "taxRatePercent", header: "Tax %" },
  { id: "total", header: "Total" },
];

function InvoiceLine() {
  const { line, applyPatch } = useLineGridRecalc({
    truth: "quantity+unitPrice",
    currency: "SGD",
    quantity: "1",
    unitPrice: "10.00",
    taxRatePercent: "9",
    taxMode: "exclusive",
  });

  return (
    <LineGrid
      line={line}
      columns={columns}
      renderCell={(id, l) => {
        switch (id) {
          case "quantity":
            return <input inputMode="decimal" value={l.quantity} onChange={(e) => applyPatch({ quantity: e.target.value })} />;
          case "unitPrice":
            return <MoneyInput amount={l.unitPrice} currency={l.currency} onAmountChange={(unitPrice) => applyPatch({ unitPrice })} />;
          case "subtotal":
            return <MoneyInput amount={l.subtotal} currency={l.currency} onAmountChange={(subtotal) => applyPatch({ subtotal, prefer: "quantity" })} />;
          case "taxRatePercent":
            return <PercentInput value={l.taxRatePercent ?? ""} onValueChange={(taxRatePercent) => applyPatch({ taxRatePercent })} />;
          case "total":
            return <span className="tabular-nums">{l.total}</span>;
        }
      }}
    />
  );
}
```

Editing `subtotal` with `prefer: "quantity"` keeps quantity, derives unit price, and flips `truth` to `"quantity+subtotal"` (e.g. qty 2 × 10.00 → subtotal `"30.00"` gives unitPrice `"15"`). That is the 2-of-3 rule from qups, not something the grid decides. Amount strings are **not** zero-padded (`"20"`, `"1.8"`); format for display with `Money.of(l.total, l.currency).format()` or your i18n layer.

## Truth modes

Pass the same `truth` string as QUPS: `"quantity+unitPrice"` (default for catalog items), `"quantity+subtotal"` (user types the line amount), `"unitPrice+subtotal"` (rare). Switch at runtime with `applyPatch({ truth: "quantity+subtotal" })`; the derived field recomputes from the two truths.

## Many lines

`useLineGridRecalc` holds **one** line. For a document, keep an array of `CalculateLineInput` in the form and derive lines with `calculateLine` directly, or render one hook per row:

```tsx
import { calculateLine, patchLine, type CalculatedLine, type PatchLineInput } from "@eristack/qups";
import { Money } from "@eristack/money";

const [lines, setLines] = useState<CalculatedLine[]>(() => initial.map(calculateLine));

const patchAt = (i: number, patch: PatchLineInput) =>
  setLines((ls) => ls.map((l, j) => (j === i ? patchLine(l, patch) : l)));

const docTotal = Money.sum(lines.map((l) => Money.of(l.total, l.currency)), "SGD");

{lines.map((line, i) => (
  <LineGrid key={i} line={line} columns={columns} renderCell={(id, l) => renderCell(id, l, (p) => patchAt(i, p))} />
))}
<p>Total: {docTotal.amountString()}</p>
```

Each `LineGrid` repeats its header row; hide all but the first with CSS (`.erista-line-grid + .erista-line-grid thead { display: none }`) or compose your own `<table>` from the hook logic — the hook is the valuable part.

## Modifiers (discounts / surcharges)

```ts
applyPatch({
  modifiers: [
    { kind: "discount", type: "percent", percent: "10" },
    { kind: "surcharge", type: "nominal", amount: "2.00" },
  ],
});
// line.discountTotal, line.surchargeTotal, line.net reflect them; line.total includes tax on net
```

Render a modifiers cell however you like; the shape is `CalculateModifierInput` from qups.

## TanStack Form

Keep the **inputs** in form state, derive the calculated line for display:

```tsx
<form.Field name={`lines[${i}].unitPrice`}>
  {(field) => <MoneyInput amount={field.state.value} currency={currency} onAmountChange={field.handleChange} />}
</form.Field>

const calc = calculateLine({ truth: "quantity+unitPrice", currency, ...form.getFieldValue(`lines[${i}]`) });
```

On submit, send the raw inputs (`truth`, `quantity`, `unitPrice`, `taxRatePercent`, `modifiers`) — not the derived totals.

## Server parity

```ts
// POST /invoices — same strings, same function
import { calculateLine, withQupsColumns } from "@eristack/qups";

const calc = calculateLine(body.lines[0]);           // throws on bad truth/inputs → 400
await db.insert(invoiceLines).values(withQupsColumns({ invoiceId, lineNo: 1 }, calc));
```

Because both sides call `calculateLine` on identical strings, the persisted `total` equals what the user saw.

## Minimal CSS

```css
.erista-line-grid { width: 100%; border-collapse: collapse; }
.erista-line-grid th, .erista-line-grid td { padding: var(--erista-density-gap-compact); border-bottom: 1px solid hsl(var(--erista-color-border)); }
.erista-line-grid td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
```

## Production path

1. Persist line **inputs** (truth, quantity, unitPrice/subtotal, modifiers, tax) plus `withQupsColumns` outputs to Drizzle detail tables.
2. Server insert: `calculateLine` / `patchLine` on the API — same strings as the UI.
3. Wrap lines in `@eristack/doc-shell` on document routes.
4. Keyboard / active cell: wrap with `@eristack/spreadsheet-operator` (do not copy arrow-key logic into this package).

## Gotchas

- There is **no `lineTotal`** on `CalculatedLine`: `subtotal` (qty × price), `net` (after modifiers), `total` (after tax).
- Partial typing: `applyPatch({ quantity: "" })` throws `quantity is required` inside `patchLine` (`"1."` is accepted). Either buffer raw text locally and patch on blur, or catch and keep the previous line.
- Outputs are unpadded decimal strings (`"20"`, `"21.8"`) — pad/format at display time, compare with `Money`, not `===` on strings.
- `useLineGridRecalc` initialises once from `initial`; pass a new object to `recalculate` when the server returns a saved line.
- `LineGrid` renders one row — N lines = N grids or your own table.
- Currency lives on the line; changing it re-parses amounts (`applyPatch({ currency })`).

## Testing

```ts
import { renderHook, act } from "@testing-library/react";
const { result } = renderHook(() => useLineGridRecalc({ truth: "quantity+unitPrice", currency: "SGD", quantity: "2", unitPrice: "10.00" }));
act(() => result.current.applyPatch({ quantity: "3" }));
expect(result.current.line.subtotal).toBe("30");     // unpadded decimal string
```

## Exports

`LineGrid`, `useLineGridRecalc` + `LineGridColumn`, `LineGridProps`.
