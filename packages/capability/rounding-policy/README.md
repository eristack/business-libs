# @eristack/rounding-policy

Named company rounding profiles that resolve to `@eristack/money` `Rounding` operators — no duplicate math.

```ts
import { createRoundingPolicyRegistry } from "@eristack/rounding-policy";
import { Money } from "@eristack/money";

const policies = createRoundingPolicyRegistry([
  { id: "ledger", currencyOverrides: { JPY: { scale: 0 } } },
]);

const op = policies.roundingFor({ policyId: "ledger", currency: "USD" });
Money.of("10.005", "USD").with(op);
```

Docs: [getting-started](./docs/getting-started.md)
