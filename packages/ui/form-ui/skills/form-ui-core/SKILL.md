---
name: form-ui-core
description: >
  @eristack/form-ui string-first native inputs: MoneyInput { amount, currency, onAmountChange,
  onParsed, round } (blur → submitAmountOnlyFormValue: HALF_EVEN to currency scale, "12.345"→"12.34",
  no padding, round:false keeps scale, invalid throws ParseError), PercentInput
  { value, onValueChange }, TimestampWallInput { value YYYY-MM-DD, onValueChange }, FormField
  { label, hint, error }. Use for document header fields, line-grid cells, filter editors with
  TanStack Form; values equal API strings (MoneyJSON/decimal/wall). No number inputs, no styles.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/form-ui"
sources:
  - packages/ui/form-ui/docs/getting-started.md
---

# @eristack/form-ui

Strings in, strings out; money normalises on blur.

```tsx
const money = createAmountOnlyFieldValidators({ currency, required: true });   // @eristack/money/react → { onChange, onSubmit }

<form.Field name="unitPrice" validators={money}>{(f) => (
  <FormField label="Unit price" error={f.state.meta.errors[0]}>
    <MoneyInput amount={f.state.value} currency={currency} onAmountChange={f.handleChange} onBlur={f.handleBlur} />
  </FormField>)}
</form.Field>
<PercentInput value={rate} onValueChange={setRate} />
<TimestampWallInput value={due} onValueChange={setDue} />   // → wallOf(due, tz) at submit
```

## Checklist

1. Form state holds decimal strings / `YYYY-MM-DD`; never `Number()`.
2. `MoneyInput` blur: `""` untouched; extra decimals rounded HALF_EVEN (or kept with `round: false`); `"1,250"`/`"abc"` throw — attach money validators so errors show before blur.
3. Currency change → re-normalise amounts with `Money.of(amount, newCurrency).amountString()`.
4. Percent/date inputs don't normalise; validate on submit (`@eristack/percent`, `@eristack/timestamp/zod`).
5. Style via `className` passthrough / `.erista-form-field*`; or use headless `useMoneyField` with shadcn `Input` for custom markup.

## Do not

- Swap to `type="number"`.
- Put thousands separators into `amount` without stripping before blur.
- Treat the wall date as an instant.
