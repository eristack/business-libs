---
title: Getting started
description: Wire MoneyInput, PercentInput, TimestampWallInput, and FormField into TanStack Form with money/percent/timestamp validators, handle blur normalisation and currency changes, style with shadcn classes, and test.
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
  <MoneyInput amount={amount} currency="USD" onAmountChange={setAmount} className="input" />
</FormField>

<FormField label="Tax rate" hint="e.g. 9 for 9%">
  <PercentInput value={rate} onValueChange={setRate} />
</FormField>

<FormField label="Due date">
  <TimestampWallInput value={dueDate} onValueChange={setDueDate} min="2026-01-01" />
</FormField>
```

`MoneyInput` normalizes on blur via `submitAmountOnlyFormValue` from `@eristack/money/react` — keep **`amount` as a decimal string**, not a JS number. Extra props (`className`, `placeholder`, `min`, `disabled`, …) pass through to the `<input>`.

## TanStack Form

```tsx
import { useForm } from "@tanstack/react-form";
import { FormField, MoneyInput, PercentInput, TimestampWallInput } from "@eristack/form-ui";
import { createAmountOnlyFieldValidators } from "@eristack/money/react";
import { wallOf } from "@eristack/timestamp";

const form = useForm({
  defaultValues: { currency: "SGD", unitPrice: "0.00", taxRate: "9", dueDate: "" },
  onSubmit: async ({ value }) => {
    await api.invoices.create({
      ...value,
      dueDate: wallOf(value.dueDate, "Asia/Singapore"),     // { kind: "wall", local, timezone }
    });
  },
});

const currency = form.useStore((s) => s.values.currency);
const money = createAmountOnlyFieldValidators({ currency, required: true });   // { onChange, onSubmit } for TanStack Form

<form.Field name="unitPrice" validators={money}>
  {(field) => (
    <FormField label="Unit price" error={field.state.meta.errors[0]}>
      <MoneyInput
        amount={field.state.value}
        currency={currency}
        onAmountChange={field.handleChange}
        onBlur={field.handleBlur}
      />
    </FormField>
  )}
</form.Field>

<form.Field name="taxRate">
  {(field) => (
    <FormField label="Tax rate">
      <PercentInput value={field.state.value} onValueChange={field.handleChange} onBlur={field.handleBlur} />
    </FormField>
  )}
</form.Field>

<form.Field name="dueDate">
  {(field) => (
    <FormField label="Due date">
      <TimestampWallInput value={field.state.value} onValueChange={field.handleChange} onBlur={field.handleBlur} />
    </FormField>
  )}
</form.Field>
```

`onBlur` from TanStack Form is called **before** the money normalisation (the component chains your `onBlur`, then parses), so validators see the raw value on blur and the normalised value on the next change.

## Currency switching

`MoneyInput` reads `currency` on blur only. If the row currency changes (e.g. SGD → JPY), re-normalise existing amounts yourself:

```ts
import { Money } from "@eristack/money";
form.setFieldValue("unitPrice", Money.of(form.getFieldValue("unitPrice"), "JPY").amountString());
```

## Blur normalisation edge cases

| Raw on blur | `round` | Result |
| --- | --- | --- |
| `"12.5"` | unset | `"12.5"` — no zero-padding; format for display with `Money.format` |
| `" 12.50 "` | unset | `"12.50"` (trimmed) |
| `"12.345"` | unset / `true` | `"12.34"` — `Rounding.currencyDefault()` = HALF_EVEN to the currency's minor units |
| `"12.355"` | unset / `true` | `"12.36"` |
| `"12.345"` | `false` | `"12.345"` — kept; validate scale server-side |
| `"1,250"` / `"abc"` | any | throws `ParseError` — strip separators in `onAmountChange` first |
| `""` | any | untouched — no parse, no callback |

The throw happens inside the blur handler; wrap the form in an error boundary **or** (better) attach `createAmountOnlyFieldValidators` so the field shows an error and the user fixes it before blur normalisation runs.

## Styling with shadcn

The inputs are plain `<input>`s: `className={cn(inputVariants(), "text-right tabular-nums")}` works. `FormField` renders `<label class="erista-form-field">` — style `__label`, `__hint`, `__error` in your CSS or replace it with shadcn's `FormItem` and keep only the inputs.

## Production path

1. **design-system** tokens in root CSS.
2. **form-ui** on header fields and line-grid money cells.
3. API bodies use the same strings / `MoneyJSON` as form state — no `Number()` on amounts; validate with `@eristack/money/zod`, `@eristack/percent`, `@eristack/timestamp/zod`.
4. For custom markup, use headless `useMoneyField` and wire your shadcn `Input`.

## Gotchas

- `PercentInput` and `TimestampWallInput` do **not** normalise; they are typed native inputs. Validate on submit.
- `MoneyInput` is `type="text"` on purpose — `type="number"` would drop trailing zeros and allow `e` notation.
- `TimestampWallInput` yields the browser's `YYYY-MM-DD`; it is not a timestamp. Attach the zone at the boundary.
- `FormField` wraps children in a `<label>`; nesting two inputs inside one field makes the label ambiguous.

## Testing

```tsx
import { fireEvent, render, screen } from "@testing-library/react";

const onAmountChange = vi.fn();
render(<MoneyInput amount="12.345" currency="SGD" onAmountChange={onAmountChange} aria-label="price" />);
fireEvent.blur(screen.getByLabelText("price"));
expect(onAmountChange).toHaveBeenLastCalledWith("12.34");
```

## Exports

| Symbol | Role |
| --- | --- |
| `FormField` | Label + hint + error wrapper |
| `MoneyInput` | Currency amount string, blur-rounded to currency scale |
| `PercentInput` | Ratio / rate string |
| `TimestampWallInput` | Wall date `YYYY-MM-DD` |
| `*Props` | prop types for each |
