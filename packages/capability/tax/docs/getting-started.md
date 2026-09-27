# Getting started

```bash
pnpm add @eristack/tax @eristack/money
```

```ts
import { createTaxRegistry } from "@eristack/tax";
import { Money } from "@eristack/money";

const tax = createTaxRegistry({
  codes: [{ code: "VAT-STD", label: "Standard VAT" }],
  rates: [
    { code: "VAT-STD", effectiveFrom: "2026-01-01", ratePercent: "10" },
  ],
});

const { ratePercent } = tax.resolveTaxRate({
  code: "VAT-STD",
  asOf: "2026-03-15",
});

const lineNet = Money.of("100.00", "USD");
const taxAmt = tax.applyTaxToAmount(lineNet, ratePercent);
```

## Collaboration

- **@eristack/money** — `Tax.onExclusive` / inclusive helpers for all amount math.
- **@eristack/qups** — pass resolved `ratePercent` into line recalc; qups owns 2-of-3 line math.
- **@eristack/rounding-policy** — round tax and totals at posting with the same company policy.
- **Persistence** — app owns Drizzle tables for codes/schedules; hydrate `createTaxRegistry` at boot or per request.

Recipe **`invoice-line-tax`**. Compose rules: `#party-and-platform-compose`.
