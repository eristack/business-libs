# Getting started

```bash
pnpm add @eristack/line-grid @eristack/qups @eristack/form-ui @eristack/money react
```

```tsx
import { LineGrid, useLineGridRecalc } from "@eristack/line-grid";
import { MoneyInput } from "@eristack/form-ui";

const { line, applyPatch } = useLineGridRecalc({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "1",
  unitPrice: "10",
});

<LineGrid
  line={line}
  columns={[
    { id: "quantity", header: "Qty" },
    { id: "unitPrice", header: "Unit price" },
  ]}
  renderCell={(id) =>
    id === "unitPrice" ? (
      <MoneyInput
        amount={line.unitPrice}
        currency={line.currency}
        onAmountChange={(unitPrice) => applyPatch({ unitPrice })}
      />
    ) : (
      line.quantity
    )
  }
/>
```

`applyPatch` delegates to `patchLine` from `@eristack/qups`.
