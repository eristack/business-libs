---
title: Getting started
description: Persist tax codes and effective-dated schedules in Drizzle, hydrate the registry, compute and round line tax at posting, and keep credit notes on the original rate.
---

# Getting started

## Install

```bash
pnpm add @eristack/tax @eristack/money @eristack/rounding-policy
```

## Tables (app-owned)

```ts
import { pgTable, text, date, uniqueIndex } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const taxCodes = pgTable("tax_codes", {
  code: text("code").primaryKey(),               // "VAT-STD"
  tenantId: text("tenant_id").notNull(),
  label: text("label"),
});

export const taxRateSchedules = pgTable(
  "tax_rate_schedules",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    code: text("code").notNull().references(() => taxCodes.code),
    effectiveFrom: date("effective_from", { mode: "string" }).notNull(),  // "YYYY-MM-DD"
    ratePercent: text("rate_percent").notNull(),                           // "10", never numeric float
  },
  (t) => [uniqueIndex("tax_sched_code_from_uq").on(t.tenantId, t.code, t.effectiveFrom)],
);
```

`rate_percent` is `text` on purpose: `numeric` would work too, but a string column guarantees no driver ever hands you `0.1 + 0.2`.

## Hydrate the registry

```ts
import { createTaxRegistry } from "@eristack/tax";

export async function taxRegistryFor(tenantId: string) {
  const [codes, rates] = await Promise.all([
    db.query.taxCodes.findMany({ where: (t, { eq }) => eq(t.tenantId, tenantId) }),
    db.query.taxRateSchedules.findMany({ where: (t, { eq }) => eq(t.tenantId, tenantId) }),
  ]);
  return createTaxRegistry({
    codes: codes.map((c) => ({ code: c.code, label: c.label ?? undefined })),
    rates: rates.map((r) => ({ code: r.code, effectiveFrom: r.effectiveFrom, ratePercent: r.ratePercent })),
  });
}
```

Cache per tenant; bust on admin save. Registries are cheap to build (sorted array + map).

## Posting an invoice line

```ts
import { Money } from "@eristack/money";
import { calculateLine } from "@eristack/qups";

const tax = await taxRegistryFor(tenantId);
const policies = await roundingRegistryFor(tenantId);   // @eristack/rounding-policy

for (const line of invoice.lines) {
  const calc = calculateLine({
    truth: "quantity+unitPrice",
    currency: invoice.currency,
    quantity: line.qty,
    unitPrice: line.unitPrice,
  });
  const net = Money.of(calc.subtotal, invoice.currency);

  const rate = tax.resolveTaxRate({ code: line.taxCode, asOf: invoice.documentDate });
  const taxAmount = tax
    .applyTaxToAmount(net, rate.ratePercent)
    .with(policies.roundingFor({ policyId: "tax", currency: invoice.currency }));

  await db.insert(invoiceLines).values({
    …,
    taxCode: rate.code,
    taxRatePercent: rate.ratePercent,        // snapshot — the schedule may change later
    taxEffectiveFrom: rate.effectiveFrom,    // audit: which schedule row applied
    taxAmount: taxAmount.amountString(),
  });
}
```

**Snapshot the resolved rate on the line.** Reports, reprints, and credit notes must not re-resolve — they read the stored `taxRatePercent`.

## Credit notes and corrections

```ts
// Credit note against an invoice line: reuse the ORIGINAL rate, not today's.
const original = await loadInvoiceLine(creditNote.originalLineId);
const creditNet = Money.of(creditNote.amount, invoice.currency).negate();
const creditTax = tax.applyTaxToAmount(creditNet, original.taxRatePercent).with(roundTax);
```

Only new documents call `resolveTaxRate`.

## Choosing `asOf`

Use the **tax point** your jurisdiction defines — usually the invoice/document date, sometimes the delivery date or payment date. It is a wall date (`YYYY-MM-DD`), the same string `@eristack/business-calendar` and `@eristack/fiscal-calendar` use. If your document stores a `@eristack/timestamp` instant, take its local date in the company zone.

## Gotchas

- `applyTaxToAmount` returns the **tax amount**, not the gross. `gross = net.add(taxAmount)`.
- Results are **unrounded** — `100.00 × 7.5%` gives `7.5`, `33.33 × 11%` gives `3.6663`. Apply `@eristack/rounding-policy` before persisting.
- `resolveTaxRate` picks the latest `effectiveFrom <= asOf`; a schedule that starts *after* your earliest document date throws `TaxRateNotFoundError` for old documents. Seed a row at `1900-01-01` (or your go-live date) for every code.
- `ratePercent` is percent points (`"10"` = 10%), matching money's `Tax.onExclusive`. If you keep basis points, convert with `@eristack/percent` `fromBasisPoints("1000")` → `"10"` first.
- No end dates: a rate applies until the next `effectiveFrom`. To "end" a tax, add a `"0"` rate row.
- Codes are not scoped by the registry — scope by building one registry per tenant.

## Testing

```ts
import { createTaxRegistry, TaxRateNotFoundError } from "@eristack/tax";
import { Money } from "@eristack/money";
import { expect, it } from "vitest";

const tax = createTaxRegistry({
  codes: [{ code: "VAT" }],
  rates: [
    { code: "VAT", effectiveFrom: "2020-01-01", ratePercent: "10" },
    { code: "VAT", effectiveFrom: "2026-04-01", ratePercent: "11" },
  ],
});

it("uses the rate in force on the document date", () => {
  expect(tax.resolveTaxRate({ code: "VAT", asOf: "2026-03-31" }).ratePercent).toBe("10");
  expect(tax.resolveTaxRate({ code: "VAT", asOf: "2026-04-01" }).ratePercent).toBe("11");
});

it("returns the tax portion, unrounded", () => {
  expect(tax.applyTaxToAmount(Money.of("33.33", "USD"), "11").amountString()).toBe("3.6663");
});

it("throws before the first schedule row", () => {
  expect(() => tax.resolveTaxRate({ code: "VAT", asOf: "2019-12-31" })).toThrow(TaxRateNotFoundError);
});
```
