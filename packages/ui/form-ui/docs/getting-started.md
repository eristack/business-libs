---
title: Getting started
description: Styled money, percent, and wall-date inputs for TanStack Form
---

# Getting started

Stack map: `@eristack/ai-knowledge#ui-package-stack`. Headless alternative: `@eristack/money/react/fields`, `@eristack/percent/react`, `@eristack/timestamp/react/fields`.

## Install

```bash
pnpm add @eristack/form-ui @eristack/design-system @eristack/money @eristack/percent @eristack/timestamp react
```

Peers (npm floors): `design-system@^0.1.0`, `money@^0.3.0`, `percent@^0.1.0`, `timestamp@^0.1.0`.

Apply Erista tokens first (`@eristack/design-system` getting-started).

## Basic fields

```tsx
import { FormField, MoneyInput, PercentInput, TimestampWallInput } from "@eristack/form-ui";

<FormField label="Unit price" error={errors.unitPrice}>
  <MoneyInput amount={amount} currency="USD" onAmountChange={setAmount} />
</FormField>

<FormField label="Tax rate">
  <PercentInput value={rate} onValueChange={setRate} />
</FormField>

<FormField label="Due date">
  <TimestampWallInput value={dueDate} onValueChange={setDueDate} />
</FormField>
```

`MoneyInput` normalizes on blur via `submitAmountOnlyFormValue` from `@eristack/money/react` — keep **`amount` as a decimal string**, not a JS number.

## TanStack Form

```tsx
import { useForm } from "@tanstack/react-form";
import { FormField, MoneyInput } from "@eristack/form-ui";

const form = useForm({
  defaultValues: { unitPrice: "0.00" },
});

<form.Field name="unitPrice">
  {(field) => (
    <FormField label="Unit price">
      <MoneyInput
        amount={field.state.value}
        currency="USD"
        onAmountChange={(amount) => field.handleChange(amount)}
      />
    </FormField>
  )}
</form.Field>
```

Validate with `@eristack/money/zod` or field validators from `@eristack/money/react` on submit.

## Production path

1. **design-system** tokens in root CSS.
2. **form-ui** on header fields and line-grid money cells.
3. API bodies use the same strings / `MoneyJSON` as form state — no `Number()` on amounts.
4. For custom markup, use headless `useMoneyField` and wire your shadcn `Input`.

## Exports

| Symbol | Role |
| --- | --- |
| `FormField` | Label + error slot |
| `MoneyInput` | Currency amount string |
| `PercentInput` | Ratio / rate string |
| `TimestampWallInput` | Wall date `YYYY-MM-DD` intent |
