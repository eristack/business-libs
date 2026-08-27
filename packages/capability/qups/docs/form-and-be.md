---
title: Form & backend
description: calculateLine / patchLine with TanStack Form and BE insert
sidebar_position: 4
---

# Form & backend

The primary API is three functions from `@eristack/qups`:

| Function | When |
| --- | --- |
| `calculateLine(input)` | Initial line, submit, or BE insert/update from SoT fields |
| `patchLine(current, patch)` | Form `onChange` / partial BE update |
| `applyCellPatch(line, field, value)` | Spreadsheet cell commit → `patchLine` (maps field keys) |
| `withQupsFields(line)` | Backseat/IndexedDB persist — snake_case SQL column names |
| `withQupsColumns(row, line)` | Merge pricing columns into an insert/update payload |

Same math both sides. UI displays strings; BE persists strings (or injectable column values).

## Input and snapshot shapes

```ts
type CalculateLineInput = {
  truth: "quantity+unitPrice" | "quantity+subtotal" | "unitPrice+subtotal";
  currency: string;
  quantity?: string;
  unitPrice?: string;
  subtotal?: string;
  modifiers?: CalculateModifierInput[];
  taxRatePercent?: string;
  taxMode?: "exclusive" | "inclusive";
  round?: boolean;
};
```

Exactly the SoT pair for `truth` must be present. Output `CalculatedLine` adds derived fields, `roles`, echoed `modifiers`, and `columns` (Drizzle-shaped camelCase).

```ts
line.quantity; // string
line.unitPrice;
line.subtotal;
line.net;
line.taxAmount;
line.total;
line.roles; // { quantity, unit_price, subtotal } → "source" | "derived"
line.columns; // for SQL insert
```

## TanStack Form lifecycle

Keep SoT fields (and truth, currency, tax rate, modifiers) in form state. On each source-field change, `patchLine` and write derived values back.

```ts
import { useForm } from "@tanstack/react-form";
import { calculateLine, patchLine } from "@eristack/qups";

const initial = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "1",
  unitPrice: "0",
  taxRatePercent: "11",
  round: true,
});

const form = useForm({
  defaultValues: {
    truth: initial.truth,
    currency: initial.currency,
    quantity: initial.quantity,
    unitPrice: initial.unitPrice,
    subtotal: initial.subtotal,
    taxRatePercent: initial.taxRatePercent ?? "",
    total: initial.total,
    net: initial.net,
    roles: initial.roles,
  },
});

function onUnitPriceChange(value: string) {
  const next = patchLine(
    {
      truth: form.getFieldValue("truth"),
      currency: form.getFieldValue("currency"),
      quantity: form.getFieldValue("quantity"),
      unitPrice: form.getFieldValue("unitPrice"),
      taxRatePercent: form.getFieldValue("taxRatePercent") || undefined,
      round: true,
    },
    { unitPrice: value },
  );

  form.setFieldValue("unitPrice", next.unitPrice);
  form.setFieldValue("subtotal", next.subtotal);
  form.setFieldValue("net", next.net);
  form.setFieldValue("total", next.total);
  form.setFieldValue("roles", next.roles);
}
```

### Disable derived inputs

```tsx
<input
  readOnly={form.getFieldValue("roles").subtotal === "derived"}
  value={form.getFieldValue("subtotal")}
/>
```

When the product lets users pick a pricing mode (e.g. “enter amount”), call `patchLine(current, { truth: "quantity+subtotal" })` (or the mode they chose) and refresh `roles`.

### Prefer when patching subtotal

```ts
patchLine(line, { subtotal: "100", prefer: "quantity" });
// keep quantity fixed → unit price adjusts (under truths that allow it)
```

## Submit → backend

On submit, do **not** trust client-only totals. Rebuild from posted SoT:

```ts
// client
const values = form.state.values;
const payload = {
  itemId: values.itemId,
  truth: values.truth,
  currency: values.currency,
  quantity: values.quantity,
  unitPrice: values.unitPrice,
  taxRatePercent: values.taxRatePercent,
  modifiers: values.modifiers,
};

// server
import { calculateLine, withQupsColumns } from "@eristack/qups";

const line = calculateLine({
  ...payload,
  round: true,
});

await db.insert(invoiceLines).values(
  withQupsColumns(
    { id, invoiceId: header.id, itemId: payload.itemId },
    line,
  ),
);
```

Alternatively accept the full snapshot and still re-run `calculateLine` on the SoT pair to detect tampering.

## Partial BE update

```ts
const existing = /* load CalculatedLine or SoT from row */;
const next = patchLine(existing, { quantity: body.quantity, round: true });
await db.update(invoiceLines).set(next.columns).where(eq(invoiceLines.id, id));
```

## `withQupsColumns` vs spreading `columns`

```ts
withQupsColumns({ itemId }, line);
// equivalent to { itemId, ...line.columns }
```

`columns` keys match `qupsLineColumns()` property names (`currency`, `unitPriceAmount`, `quantityRatioNumerator`, …). See [Stores & Drizzle](./stores.md).

## Lower-level `PricingLine` (optional)

When domain code already has `Money`:

```ts
import { Money } from "@eristack/money";
import { PricingLine } from "@eristack/qups";

const line = PricingLine.of({
  qups: {
    truth: "quantity+unitPrice",
    quantity: "2",
    unitPrice: Money.of("50", "USD"),
  },
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  tax: { ratePercent: "11" },
});

line.total; // Money
line.editQups({ quantity: "3" });
```

Prefer `calculateLine` at the form/HTTP boundary; use `PricingLine` inside richer domain services.

## Checklist

1. Form holds SoT + tax/modifiers; derived fields are read-only per `roles`
2. Every source change → `patchLine` → write derived strings back
3. Submit sends SoT (not only `total`)
4. BE runs `calculateLine` again with `round: true`
5. Persist via `withQupsColumns` or an explicit map to your columns
