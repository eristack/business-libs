---
title: Overview
description: Registry of tax codes with effective-dated rate schedules — resolve "VAT-STD as of 2026-03-15" to a percent string and compute the tax amount with @eristack/money.
---

# @eristack/tax

Tax rates change on dates. An invoice dated 31 March must use the old rate even if you post it in April; a credit note against it must use the same rate the original used. `@eristack/tax` stores **codes** (`VAT-STD`, `VAT-ZERO`, `WHT-2`) and a **schedule** of `(code, effectiveFrom, ratePercent)` rows, and answers "which rate applies to code X on date D?" deterministically.

The arithmetic is delegated to `@eristack/money` (`Tax.onExclusive`) so tax math is identical to every other money operation in your system — string decimals, no floats.

## Use it when

- Invoice/order lines carry a tax code and a document date.
- Rates are versioned (statutory changes, temporary reductions).
- You need one place that knows "10%" and returns it as a string `"10"` for `@eristack/qups` and `@eristack/money`.

## Not for

- Tax jurisdiction lookup (which code applies to this customer/product/region) — app rules.
- Inclusive-price extraction — `Tax.extractFromInclusive` in `@eristack/money` directly.
- Rounding — `@eristack/rounding-policy` after computing.
- Filing/reporting formats — app.

## Install

```bash
pnpm add @eristack/tax @eristack/money
```

Peer: `@eristack/money ^0.3.0`.

## 30-second example

```ts
import { createTaxRegistry } from "@eristack/tax";
import { Money } from "@eristack/money";

const tax = createTaxRegistry({
  codes: [{ code: "VAT-STD", label: "Standard VAT" }],
  rates: [
    { code: "VAT-STD", effectiveFrom: "2020-01-01", ratePercent: "10" },
    { code: "VAT-STD", effectiveFrom: "2026-04-01", ratePercent: "11" },
  ],
});

tax.resolveTaxRate({ code: "VAT-STD", asOf: "2026-03-31" }); // { code, effectiveFrom: "2020-01-01", ratePercent: "10" }
tax.resolveTaxRate({ code: "VAT-STD", asOf: "2026-04-01" }); // { …, effectiveFrom: "2026-04-01", ratePercent: "11" }

const net = Money.of("100.00", "USD");
tax.applyTaxToAmount(net, "11");   // Money 11.00 — the TAX AMOUNT, not the gross
net.add(tax.applyTaxToAmount(net, "11")); // 111.00 gross
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createTaxRegistry` | `(initial?: { codes?: TaxCode[]; rates?: TaxRateScheduleEntry[] }) => registry` | Codes are registered before rates; a rate for an unknown code throws `TaxCodeNotFoundError`. |
| `registerTaxCode` | `(entry: TaxCode) => void` | Upsert by trimmed `code`. |
| `registerRateSchedule` | `(entry: TaxRateScheduleEntry) => void` | Appends; `effectiveFrom` must be `YYYY-MM-DD`; `ratePercent` trimmed. Schedule kept sorted by `(code, effectiveFrom)`. |
| `resolveTaxRate` | `({ code, asOf }) => ResolvedTaxRate` | Latest entry with `effectiveFrom <= asOf`. Throws `TaxCodeNotFoundError` / `TaxRateNotFoundError`. |
| `applyTaxToAmount` | `(base: Money, ratePercent: string) => Money` | `base.with(Tax.onExclusive(ratePercent))` — returns the **tax portion**, unrounded. |
| `listTaxCodes` | `() => TaxCode[]` | For selects/admin. |
| `TaxCode` | `{ code: string; label?: string }` | |
| `TaxRateScheduleEntry` | `{ code; effectiveFrom: "YYYY-MM-DD"; ratePercent: string }` | `ratePercent` is percent points: `"10"` = 10%. `"10%"` also accepted by money. |
| `ResolvedTaxRate` | `{ code; effectiveFrom; ratePercent }` | Persist `effectiveFrom` on the document line for audit. |
| `TaxCodeNotFoundError` | `Error` with `.code` | |
| `TaxRateNotFoundError` | `Error` with `.code`, `.asOf` | No schedule row on or before `asOf`. |

## Works with

- `@eristack/qups` — feed `ratePercent` into line tax (`calculateLine` modifiers) or compute on the line subtotal with `applyTaxToAmount`.
- `@eristack/rounding-policy` — `.with(policies.roundingFor({ policyId: "tax", currency }))` after `applyTaxToAmount`.
- `@eristack/percent` — if you store rates as basis points, convert with `fromBasisPoints` before registering.
- `@eristack/fiscal-calendar` / `@eristack/business-calendar` — `asOf` is the same wall-date string.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/tax#tax-core`
- Recipe: `invoice-line-tax`.

## Next

- [Getting started](./getting-started.md) — codes and schedules in Drizzle, invoice posting with rounding, credit notes at the original rate.
