---
title: Tax
description: Exclusive and inclusive line tax on Money
sidebar_position: 7
---

# Tax

`LineTax` (and `taxRatePercent` on `calculateLine`) sits **after** modifiers.
Tax math delegates to `@eristack/money` Tax operators so currency rounding rules
stay consistent with the rest of the stack.

## Modes

| Mode | Input | Output |
| --- | --- | --- |
| **Exclusive** (`net+rate`) | net + rate% | tax amount + gross |
| **Inclusive** (`gross+rate`) | gross + rate% | split net + tax |
| **Fixed** (`net+tax`) | net + tax money | gross = net + tax |

Default line path is **exclusive**: net after modifiers, then `taxRatePercent`.

```text
QUPS subtotal → modifiers → net ──► tax @ rate% ──► gross (payable)
```

## calculateLine

```ts
import { calculateLine } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "10" }],
  taxRatePercent: "11",
  round: true,
});

line.net; // after discount
line.taxAmount;
line.total; // payable gross
```

## Inclusive lines

When the entered amount already includes tax, use inclusive mode on
`PricingLine` / `LineTax`:

```ts
import { Money } from "@eristack/money";
import { PricingLine } from "@eristack/qups";

const line = PricingLine.of({
  qups: {
    truth: "quantity+unitPrice",
    quantity: "1",
    unitPrice: Money.of("11", "USD"),
  },
  tax: { ratePercent: "10", mode: "inclusive" },
});
// adjusted.net treated as inclusive gross → split net + tax
```

Be explicit in UX: users should know whether the unit price is tax-in or tax-out.

## Rounding

Prefer ledger rounding once per line (or document) via Money’s
`Rounding.currencyDefault()` — avoid double-rounding tax then total.

Exclusive tax on a discounted net is usually what finance expects for
B2B invoices; inclusive is common for retail shelf prices.

## Document totals

Sum **`line.total`** (or Money sums of gross) for the document payable.
Do not re-tax the document sum unless your jurisdiction requires a header-level
tax algorithm — that is app policy outside QUPS.

## Gotchas

| Pitfall | Fix |
| --- | --- |
| Tax before discount | Modifiers first, then tax |
| JS `* 0.11` | `taxRatePercent` / Money Tax |
| Mixing inclusive unit with exclusive header | One story per document type |
| Persisting only gross | Store net, tax, rate, mode for audit |

## Next

- [Modifiers](./modifiers.md)
- [QUPS](./qups.md)
- [Recipes](./recipes.md)
