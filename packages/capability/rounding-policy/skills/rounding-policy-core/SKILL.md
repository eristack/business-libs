---
name: rounding-policy-core
description: >
  @eristack/rounding-policy createRoundingPolicyRegistry → roundingFor({ policyId, currency })
  resolves named company rounding rules (invoice, tax, payroll) with per-currency overrides to
  @eristack/money Rounding operators. Use to round once at posting instead of scale/mode literals
  in services. Math stays in money; qups/tax outputs are unrounded until this is applied.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/rounding-policy"
sources:
  - packages/capability/rounding-policy/docs/getting-started.md
---

# @eristack/rounding-policy

Named rounding rules → `MonetaryOperator`. Hydrate from a tenant table; apply at the ledger/invoice boundary.

```ts
import { createRoundingPolicyRegistry } from "@eristack/rounding-policy";

const policies = createRoundingPolicyRegistry([
  { id: "invoice", scale: 2, mode: "HALF_EVEN", currencyOverrides: { JPY: { scale: 0, mode: "DOWN" } } },
  { id: "tax", scale: 2, mode: "HALF_UP" },
]);
const round = policies.roundingFor({ policyId: "invoice", currency: "JPY" }); // throws RoundingPolicyNotFoundError
Money.of("1234.9", "JPY").with(round);                                        // 1234
```

Resolution: override `scale` → policy `scale` → `Rounding.currencyDefault(currency, mode)`; default mode `HALF_EVEN`.

## Checklist

1. Table `rounding_policies(id, tenant_id, scale?, mode?, currency_overrides jsonb)`; hydrate per tenant, cache, bust on admin save.
2. Compute lines with `@eristack/qups` and tax with `@eristack/tax` **unrounded**; sum; then `.with(roundingFor(...))` once before `ledger.post` / invoice persist.
3. Persist the rounded net, tax, and gross that print on the document.
4. Always pass `currency` — policies without `scale` need it for currency defaults.

## Do not

- Write `Rounding.of(2, "HALF_EVEN")` literals in services — register a policy.
- Rely on a mode-only `currencyOverrides` entry — it is skipped unless `scale` is set.
- Round per line then sum (totals drift); round the aggregate.
- Model cash rounding (0.05 increments) as a scale — app-level on top of money.
