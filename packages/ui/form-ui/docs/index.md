---
title: Overview
description: Native React inputs for Eristack domain values — MoneyInput (blur-normalised decimal string), PercentInput, TimestampWallInput (YYYY-MM-DD), FormField label/hint/error wrapper — string-first so form state equals API body.
---

# @eristack/form-ui

Money, percent, and wall-date fields are where ERP forms go wrong: someone binds an `<input type="number">`, the value becomes a float, `19.99 * 3` becomes `59.97000000000001`, and the API receives a number where it expects `"59.97"`. `@eristack/form-ui` ships four small components that keep those values as **strings** and delegate normalisation to `@eristack/money`, so the value in TanStack Form state is byte-for-byte what `@eristack/money/zod` validates on the server.

They are unstyled native `<input>`s (`FormField` is a `<label>` with `erista-form-field*` hooks) — put your shadcn classes on them via `className`.

## Use it when

- Header fields on document forms (unit price, tax rate, due date) and cells in `@eristack/line-grid`.
- Filter value editors in `@eristack/filter-builder`.
- Any form whose payload uses `MoneyJSON` / decimal strings / wall dates.

## Not for

- Custom markup around headless logic — use `useMoneyField` from `@eristack/money/react/fields` and `@eristack/percent/react`, `@eristack/timestamp/react/fields` directly.
- Instants (`posted_at`) — `TimestampWallInput` is calendar-date only; instants come from the server.
- Formatting for display — `Money.format` / your i18n layer.

## Install

```bash
pnpm add @eristack/form-ui @eristack/design-system @eristack/money @eristack/percent @eristack/timestamp react
```

Peers: `@eristack/design-system ^0.1.0`, `@eristack/money ^0.3.0`, `@eristack/percent ^0.1.0`, `@eristack/timestamp ^0.1.0`, `react`.

## 30-second example

```tsx
import { FormField, MoneyInput, PercentInput, TimestampWallInput } from "@eristack/form-ui";

<FormField label="Unit price" error={errors.unitPrice}>
  <MoneyInput amount={unitPrice} currency="SGD" onAmountChange={setUnitPrice} />
</FormField>
<FormField label="Tax rate" hint="Percent, e.g. 9">
  <PercentInput value={taxRate} onValueChange={setTaxRate} />
</FormField>
<FormField label="Due date">
  <TimestampWallInput value={dueDate} onValueChange={setDueDate} />
</FormField>
```

## API

| Export | Props (beyond native `<input>` attrs) | Behaviour |
| --- | --- | --- |
| `MoneyInput` | `amount: string; currency: string; onAmountChange?(amount); onParsed?(amount); round?: boolean` | `type="text" inputMode="decimal" data-currency`. Every keystroke → `onAmountChange(raw)`. On **blur** (non-empty) → `submitAmountOnlyFormValue(raw, currency, { round })` from `@eristack/money/react`, then `onAmountChange(normalized)` **and** `onParsed(normalized)`. Default (`round` unset) rounds to the currency scale with HALF_EVEN (`"12.345"` → `"12.34"`); `round: false` keeps extra decimals; it does **not** pad (`"12.5"` stays `"12.5"`). Invalid input (`"1,250"`, `"abc"`) throws `ParseError` on blur — pre-validate with `createAmountOnlyFieldValidators`. |
| `PercentInput` | `value: string; onValueChange?(value)` | `type="text" inputMode="decimal"`; no normalisation — validate with `@eristack/percent` on submit. |
| `TimestampWallInput` | `value: string; onValueChange?(value)` | `type="date"`; value is `YYYY-MM-DD` (browser-native), pair with a timezone at the API (`wallOf(local, tz)`). |
| `FormField` | `{ label?, hint?, error?, children }` | `<label class="erista-form-field">` → `__label`, children, `__hint`, `__error`. Native label association via wrapping. |

## Works with

- `@tanstack/react-form` — `field.state.value` ↔ `amount`/`value`; `field.handleChange` ↔ `onAmountChange`/`onValueChange`.
- `@eristack/money/zod`, `@eristack/percent`, `@eristack/timestamp/zod` — validate the same strings server-side.
- `@eristack/qups` — `patchLine({ unitPrice })` with the string from `MoneyInput`.
- `@eristack/line-grid` — cells; `@eristack/filter-builder` — value editors.
- `@eristack/design-system` — density tokens for field spacing.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/form-ui#form-ui-core`
- Recipe: `erp-ui-shell`. Money rules: `@eristack/money#money-adapters` (`createAmountOnlyFieldValidators`).

## Next

- [Getting started](./getting-started.md) — TanStack Form wiring, validators, currency switching, blur-normalisation edge cases, shadcn styling, and testing.
