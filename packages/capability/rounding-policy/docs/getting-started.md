---
title: Getting started
description: "Load @eristack/ai-knowledge#party-and-platform-compose for posting-date-guard and invoice pipelines."
---

# Getting started

```bash
pnpm add @eristack/rounding-policy @eristack/money
```

```ts
import { createRoundingPolicyRegistry } from "@eristack/rounding-policy";
import { Money } from "@eristack/money";

const policies = createRoundingPolicyRegistry();

policies.registerPolicy({
  id: "invoice",
  scale: 2,
  mode: "HALF_EVEN",
  currencyOverrides: { JPY: { scale: 0, mode: "DOWN" } },
});

const round = policies.roundingFor({ policyId: "invoice", currency: "USD" });
const total = Money.of("99.995", "USD").with(round);
```

## Collaboration

- **@eristack/money** — all rounding math lives here; policies only select `Rounding.of` or `Rounding.currencyDefault`.
- **@eristack/qups** — line totals; apply policy rounding after `calculateLine` when posting.
- **@eristack/tax** — tax amounts use the same policy at post time via `applyTaxToAmount` + shared `roundingFor`.

Load `@eristack/ai-knowledge#party-and-platform-compose` for **`posting-date-guard`** and invoice pipelines.
