---
name: tax-core
description: >
  @eristack/tax createTaxRegistry → resolveTaxRate({ code, asOf }) picks the effective-dated
  percent string; applyTaxToAmount(net, rate) returns the unrounded TAX PORTION via
  @eristack/money Tax.onExclusive. Use for invoice/order line tax with versioned statutory
  rates; snapshot the resolved rate on the line. Jurisdiction rules and rounding stay outside.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/tax"
sources:
  - packages/capability/tax/docs/getting-started.md
---

# @eristack/tax

Codes + `(code, effectiveFrom, ratePercent)` schedule → deterministic rate for a document date. Math delegated to money.

```ts
import { createTaxRegistry } from "@eristack/tax";

const tax = createTaxRegistry({
  codes: [{ code: "VAT-STD" }],
  rates: [{ code: "VAT-STD", effectiveFrom: "2020-01-01", ratePercent: "10" },
          { code: "VAT-STD", effectiveFrom: "2026-04-01", ratePercent: "11" }],
});
const rate = tax.resolveTaxRate({ code: "VAT-STD", asOf: invoice.documentDate }); // latest effectiveFrom <= asOf
const taxAmount = tax.applyTaxToAmount(net, rate.ratePercent);                    // tax portion, unrounded
const gross = net.add(taxAmount.with(roundTax));                                  // round via @eristack/rounding-policy
// errors: TaxCodeNotFoundError, TaxRateNotFoundError (no row on/before asOf)
```

## Checklist

1. Tables `tax_codes(code, tenant_id, label)` + `tax_rate_schedules(code, effective_from date, rate_percent text)`; hydrate one registry per tenant, cache.
2. `asOf` = the tax point (usually document date) as `YYYY-MM-DD`.
3. Persist `taxRatePercent` + `taxEffectiveFrom` on each line; credit notes reuse the stored rate — never re-resolve.
4. Round once with `@eristack/rounding-policy` (`policyId: "tax"`) before persist/post.
5. Seed a `1900-01-01` (or go-live) row per code so old documents resolve.

## Do not

- Treat `applyTaxToAmount` as gross — it is the tax amount.
- Store rates as floats or basis points without converting (`@eristack/percent` `fromBasisPoints`).
- Put jurisdiction/product tax-code selection here — app rules decide the `code`.
- Extract tax from inclusive prices via this package — `Tax.extractFromInclusive` in money.
