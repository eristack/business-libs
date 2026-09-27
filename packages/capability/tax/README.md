# @eristack/tax

Tax **codes** and **effective-dated rate schedules**. Rate math delegates to `@eristack/money` `Tax.onExclusive` — not Avalara.

```ts
import { createTaxRegistry } from "@eristack/tax";

const tax = createTaxRegistry();
tax.registerTaxCode({ code: "VAT-STD" });
tax.registerRateSchedule({ code: "VAT-STD", effectiveFrom: "2026-01-01", ratePercent: "10" });
tax.resolveTaxRate({ code: "VAT-STD", asOf: "2026-06-01" });
```

Docs: [getting-started](./docs/getting-started.md)
