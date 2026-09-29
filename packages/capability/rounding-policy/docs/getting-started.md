---
title: Getting started
description: Store rounding policies in a table, hydrate the registry, and round invoice, tax, and ledger amounts once at the posting boundary.
---

# Getting started

## Install

```bash
pnpm add @eristack/rounding-policy @eristack/money
```

## Policies are finance configuration — put them in a table

```ts
// schema.ts (app-owned)
import { pgTable, text, integer, jsonb } from "drizzle-orm/pg-core";
import type { CurrencyRoundingOverride } from "@eristack/rounding-policy";

export const roundingPolicies = pgTable("rounding_policies", {
  id: text("id").primaryKey(),                 // "invoice" | "tax" | "payroll" — the policyId
  tenantId: text("tenant_id").notNull(),
  label: text("label"),
  scale: integer("scale"),                     // null → currency default minor units
  mode: text("mode").$type<RoundingMode>(),    // "HALF_EVEN" | "HALF_UP" | … ; null → HALF_EVEN
  currencyOverrides: jsonb("currency_overrides").$type<Record<string, CurrencyRoundingOverride>>(),
});
```

```ts
// rounding.service.ts
import { createRoundingPolicyRegistry } from "@eristack/rounding-policy";

export async function roundingRegistryFor(tenantId: string) {
  const rows = await db.query.roundingPolicies.findMany({ where: (t, { eq }) => eq(t.tenantId, tenantId) });
  return createRoundingPolicyRegistry(
    rows.map((r) => ({
      id: r.id,
      label: r.label ?? undefined,
      scale: r.scale ?? undefined,
      mode: r.mode ?? undefined,
      currencyOverrides: r.currencyOverrides ?? undefined,
    })),
  );
}
```

Cache per tenant and invalidate on admin save (`@eristack/epoch` scope `rounding-policies` if you already use it).

## Round once, at the boundary

`@eristack/qups` and `@eristack/tax` return **unrounded** decimal strings on purpose — rounding each line and then summing produces a different total than summing and then rounding. Pick one place (posting) and apply the policy there:

```ts
import { Money } from "@eristack/money";
import { calculateLine } from "@eristack/qups";

const policies = await roundingRegistryFor(tenantId);
const roundInvoice = policies.roundingFor({ policyId: "invoice", currency: invoice.currency });
const roundTax = policies.roundingFor({ policyId: "tax", currency: invoice.currency });

const lines = invoice.lines.map((l) =>
  calculateLine({ truth: "quantity+unitPrice", currency: invoice.currency, quantity: l.qty, unitPrice: l.price }),
);
const net = Money.sum(lines.map((l) => Money.of(l.subtotal, invoice.currency)));
const rate = taxRegistry.resolveTaxRate({ code: invoice.taxCode, asOf: invoice.date }).ratePercent;

const taxAmount = taxRegistry.applyTaxToAmount(net, rate).with(roundTax);   // rounded tax
const netRounded = net.with(roundInvoice);
const gross = netRounded.add(taxAmount);                                    // no further rounding needed

await ledger.post({ /* … */ amount: gross });
```

Store `netRounded`, `taxAmount`, `gross` — the three numbers that appear on the printed invoice — so what the customer sees equals what the ledger holds.

## Per-currency overrides

```ts
policies.registerPolicy({
  id: "invoice",
  scale: 2,
  mode: "HALF_EVEN",
  currencyOverrides: {
    JPY: { scale: 0, mode: "DOWN" },   // yen: truncate to whole units
    KWD: { scale: 3 },                 // dinar: 3 minor units, inherits HALF_EVEN
  },
});
```

Override keys are matched after `trim().toUpperCase()`, so `"jpy"` works — but store them upper-case anyway.

## Gotchas

- **Mode-only overrides are ignored.** `currencyOverrides: { USD: { mode: "HALF_UP" } }` with no `scale` falls through to the policy default. Always set `scale` on an override (copy the policy's scale if you only want to change the mode).
- No `scale` and no `currency` → `Rounding.currencyDefault(undefined, mode)` — money will throw. Pass `currency` whenever the policy relies on currency defaults.
- `UNNECESSARY` mode makes money **throw** if rounding would change the value — useful as a "this must already be exact" assertion at ledger post, dangerous as a default.
- The registry is in-memory and per-instance. Hydrate from your table; do not treat the seed array in code as the source of truth in production.
- Cash rounding (to 0.05) is not a scale. Implement as `amount.divide("0.05").with(Rounding.of(0, "HALF_UP")).multiply("0.05")` in the app if you need it.

## Testing

```ts
import { createRoundingPolicyRegistry, RoundingPolicyNotFoundError } from "@eristack/rounding-policy";
import { Money } from "@eristack/money";
import { expect, it } from "vitest";

const policies = createRoundingPolicyRegistry([
  { id: "invoice", scale: 2, mode: "HALF_EVEN", currencyOverrides: { JPY: { scale: 0, mode: "DOWN" } } },
]);

it("resolves per currency", () => {
  expect(Money.of("2.345", "USD").with(policies.roundingFor({ policyId: "invoice", currency: "USD" })).amountString()).toBe("2.34");
  expect(Money.of("1234.9", "JPY").with(policies.roundingFor({ policyId: "invoice", currency: "JPY" })).amountString()).toBe("1234");
});

it("unknown policy throws", () => {
  expect(() => policies.roundingFor({ policyId: "nope" })).toThrow(RoundingPolicyNotFoundError);
});
```
