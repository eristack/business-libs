---
title: Getting started
description: QUPS line grid with patchLine recalculation
---

# Getting started

Line math is **only** in `@eristack/qups` — this package calls `patchLine` via `useLineGridRecalc`. Document spine: `@eristack/ai-knowledge#document-lines-erp`.

## Install

```bash
pnpm add @eristack/line-grid @eristack/qups @eristack/form-ui @eristack/money react
```

Peers: `form-ui@^0.1.0`, `qups@^0.3.0`, `money@^0.3.0`.

## Hook + grid

```tsx
import { LineGrid, useLineGridRecalc } from "@eristack/line-grid";
import { MoneyInput } from "@eristack/form-ui";

function InvoiceLines() {
  const { line, applyPatch } = useLineGridRecalc({
    truth: "quantity+unitPrice",
    currency: "USD",
    quantity: "1",
    unitPrice: "10.00",
  });

  return (
    <LineGrid
      line={line}
      columns={[
        { id: "quantity", header: "Qty" },
        { id: "unitPrice", header: "Unit price" },
        { id: "lineTotal", header: "Total" },
      ]}
      renderCell={(id) => {
        if (id === "unitPrice") {
          return (
            <MoneyInput
              amount={line.unitPrice}
              currency={line.currency}
              onAmountChange={(unitPrice) => applyPatch({ unitPrice })}
            />
          );
        }
        if (id === "quantity") {
          return (
            <input
              value={line.quantity}
              onChange={(e) => applyPatch({ quantity: e.target.value })}
            />
          );
        }
        return line.lineTotal;
      }}
    />
  );
}
```

## Truth modes

Pass the same `truth` string as QUPS (`quantity+unitPrice`, `quantity+lineTotal`, etc.). `applyPatch` merges partial line updates and recalculates the third field.

## Production path

1. Persist line strings from form state to Drizzle detail tables.
2. Server insert: `calculateLine` / `patchLine` on the API — same strings as the UI.
3. Wrap lines in `@eristack/doc-shell` on document routes.

## Exports

`LineGrid`, `useLineGridRecalc`.
