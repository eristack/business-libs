---
title: Overview
description: Name your company's rounding rules once ("invoice", "payroll", "fx") and resolve them to @eristack/money Rounding operators per currency — instead of scattering scale/mode literals through services.
---

# @eristack/rounding-policy

Every ERP rounds money in more than one way: invoices to 2 places half-even, JPY to 0 places, cash payments to the nearest 0.05, payroll to the cent half-up. Without a registry those rules become `Rounding.of(2, "HALF_EVEN")` literals in forty files — and one of them is wrong.

`@eristack/rounding-policy` gives each rule a **name** and a **currency-aware resolution**: ask for `{ policyId: "invoice", currency: "JPY" }` and get the right `MonetaryOperator` back. All math stays in `@eristack/money`; this package only decides *which* rounding to apply.

## Use it when

- Two or more places in the codebase round the same kind of amount (invoice totals, tax, payroll, FX results).
- Rounding differs by currency (JPY/IDR 0 decimals, KWD 3) or by document type.
- Rounding rules are configuration a finance admin should be able to change without a deploy (load definitions from a table).

## Not for

- Doing the rounding — `Money.with(Rounding.of(...))` in `@eristack/money`.
- Cash rounding to 0.05/0.10 increments — not modelled; implement in the app on top of money.
- Line-level qty × price math — `@eristack/qups` (round its output with a policy at posting).

## Install

```bash
pnpm add @eristack/rounding-policy @eristack/money
```

Peer: `@eristack/money ^0.3.0`.

## 30-second example

```ts
import { createRoundingPolicyRegistry } from "@eristack/rounding-policy";
import { Money } from "@eristack/money";

const policies = createRoundingPolicyRegistry([
  { id: "invoice", scale: 2, mode: "HALF_EVEN", currencyOverrides: { JPY: { scale: 0, mode: "DOWN" } } },
  { id: "payroll", mode: "HALF_UP" },            // no scale → currency default minor units
]);

Money.of("99.995", "USD").with(policies.roundingFor({ policyId: "invoice", currency: "USD" })); // 100.00
Money.of("1234.5", "JPY").with(policies.roundingFor({ policyId: "invoice", currency: "JPY" }));  // 1234
Money.of("10.005", "USD").with(policies.roundingFor({ policyId: "payroll", currency: "USD" }));  // 10.01
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createRoundingPolicyRegistry` | `(initial?: RoundingPolicyDefinition[]) => { registerPolicy, roundingFor, listPolicies }` | In-memory registry; hydrate from your table at boot or per request. |
| `registerPolicy` | `(def: RoundingPolicyDefinition) => void` | Upserts by `id` (trimmed). Empty id throws. |
| `roundingFor` | `({ policyId, currency? }) => MonetaryOperator` | Throws `RoundingPolicyNotFoundError` for unknown id. Resolution order below. |
| `listPolicies` | `() => RoundingPolicyDefinition[]` | For admin screens. |
| `RoundingPolicyDefinition` | `{ id; label?; scale?; mode?; currencyOverrides?: Record<string, { scale?; mode? }> }` | `mode` is money's `RoundingMode`: `UP DOWN CEILING FLOOR HALF_UP HALF_DOWN HALF_EVEN UNNECESSARY`. |
| `CurrencyRoundingOverride` | `{ scale?: number; mode?: RoundingMode }` | Keys are upper-cased ISO codes. |
| `RoundingPolicyNotFoundError` | `Error` with `policyId` | |

### Resolution order (`roundingFor`)

1. `currencyOverrides[CURRENCY].scale` set → `Rounding.of(override.scale, override.mode ?? def.mode ?? "HALF_EVEN")`
2. else `def.scale` set → `Rounding.of(def.scale, def.mode ?? "HALF_EVEN")`
3. else → `Rounding.currencyDefault(currency, def.mode ?? "HALF_EVEN")` (minor units from the money registry)

An override with only `mode` (no `scale`) is **not** applied in step 1 — see gotchas in [Getting started](./getting-started.md).

## Works with

- `@eristack/money` — the operators come from here; chain `.with(round)` at the end of a pipeline.
- `@eristack/tax` — `applyTaxToAmount(...)` then `.with(policies.roundingFor({ policyId: "tax", currency }))`.
- `@eristack/qups` — `calculateLine` produces unrounded strings; round when posting to the ledger.
- `@eristack/financial-ledger` — round **once**, at the boundary, before `post`.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/rounding-policy#rounding-policy-core`
- Recipe: `ledger-rounding-policy`.

## Next

- [Getting started](./getting-started.md) — policies as a Drizzle table, invoice posting pipeline, and the mode-only-override gotcha.
