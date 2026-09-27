# Getting started

```bash
pnpm add @eristack/form-ui @eristack/money @eristack/percent @eristack/timestamp @eristack/design-system react
```

```tsx
import { FormField, MoneyInput, PercentInput, TimestampWallInput } from "@eristack/form-ui";

<FormField label="Unit price">
  <MoneyInput amount={amount} currency="USD" onAmountChange={setAmount} />
</FormField>
```

`MoneyInput` normalizes on blur via `submitAmountOnlyFormValue` from `@eristack/money/react`.
