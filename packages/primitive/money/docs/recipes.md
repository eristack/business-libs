---
title: ERP recipes
description: End-to-end invoice, payment, tax, FX, and custom-unit workflows
sidebar_position: 14
---

# ERP recipes

Complete flows, not snippets. Each recipe states the problem, the shape of the solution, and the decisions you still own. Amounts shown in comments are the values these examples actually produce.

Throughout, `round` is the currency-default rounding operator:

```ts
import { Money, Rounding } from "@eristack/money";

const round = Rounding.currencyDefault();
```

## Invoice lines → discount → tax → total

**Problem.** Three order lines, a 5% document discount, 11% tax on the net, and a grand total that ties out against the stored line values.

**Approach.** Compute each line exactly, round each posted value once, and decide explicitly whether tax is calculated per line or on the document subtotal.

```ts
import { Discount, Money, Rounding, Tax } from "@eristack/money";

const round = Rounding.currencyDefault();

const lines = [
  { qty: 3, unitPrice: "49.90" },
  { qty: 1, unitPrice: "199.00" },
  { qty: 12, unitPrice: "4.95" },
];

// 1. Line nets — posted values, so round each one
const lineNets = lines.map((line) =>
  Money.of(line.unitPrice, "USD").multiply(line.qty).with(round),
);
// [149.70, 199.00, 59.40]

// 2. Document subtotal
const subtotal = Money.sum(lineNets, "USD"); // 408.10

// 3. Document discount
const net = subtotal.with(Discount.ofPercent("5")).with(round); // 387.70

// 4. Tax on the discounted net
const tax = net.with(Tax.onExclusive("11")).with(round); // 42.65

// 5. Grand total
const total = Money.sum([net, tax]); // 430.35
```

Notes that matter in production:

- `multiply(line.qty)` takes an integer quantity. Fractional quantities must be strings (`multiply("2.5")`) — see [gotchas](./gotchas.md#fractional-number-factors-are-rejected-in-percent-helpers).
- `Money.sum(lineNets, "USD")` passes the currency so an empty document returns `0.00 USD` instead of throwing.
- Tax base is the **discounted** net here. Discount-after-tax is a different (and legitimate) rule — pick one per document type and encode it once.

**Per-line tax vs document tax.** These can differ by cents, and both appear in real ERPs:

```ts
const perLineTax = lineNets.map((n) => n.with(Tax.onExclusive("11")).with(round));
Money.sum(perLineTax, "USD");                          // 44.89
subtotal.with(Tax.onExclusive("11")).with(round);      // 44.89 — agrees here
```

Agreement is luck, not a guarantee. If your tax report groups by rate, compute tax **per rate bucket** and store the tax lines you actually posted, rather than recomputing at read time.

**Persist the posted values:**

```ts
await db.insert(invoices).values({
  netAmount: net.toJSON().amount,   // "387.7"
  taxAmount: tax.toJSON().amount,   // "42.65"
  totalAmount: total.toJSON().amount, // "430.35"
  currency: total.currency.currencyCode,
});
```

Amount strings are normalized — `387.70` serializes as `"387.7"`. That is a decimal string, not a display string; see [serialization](./serialization.md) and [formatting](./formatting.md).

## Allocate one payment across open invoices

**Problem.** A customer pays `500.00 USD` against three open invoices (`250.00`, `400.55`, `349.45`). Cash applied must equal cash received, to the cent.

**Approach.** Choose a policy first — pro-rata or oldest-first. They produce different rows and both need to sum exactly.

**Pro-rata by open balance:**

```ts
const payment = Money.of("500.00", "USD");
const open = [
  Money.of("250.00", "USD"),
  Money.of("400.55", "USD"),
  Money.of("349.45", "USD"),
];

const shares = payment.allocateByRatios(open.map((b) => Number(b.amountString())));
// [125.00, 200.28, 174.72]

Money.sum(shares, "USD").isEqualTo(payment); // true — always
```

Ratios are weights, so raw balances work directly. `Number(...)` here is safe because it is only a **weight**, never an amount. Never let that number back into monetary math.

**Oldest-first (FIFO) settlement:**

```ts
let remaining = payment;

const applied = open.map((balance) => {
  const take = Money.min(remaining, balance);
  remaining = remaining.subtract(take);
  return take;
});
// [250.00, 250.00, 0.00], remaining 0.00
```

Then reconcile before writing anything:

```ts
const cashApplied = Money.sum(applied, "USD");
if (!cashApplied.add(remaining).isEqualTo(payment)) {
  throw new Error("Cash application does not tie out");
}
```

Leftover `remaining` is an unapplied credit — a real domain object, not a rounding error. Zero-value shares from pro-rata allocation (possible on small payments) should be filtered before creating application rows, not avoided by pre-dividing. See [allocate](./allocate.md).

## Multi-currency report with app-supplied FX

**Problem.** Roll up receivables held in EUR, IDR, JPY, and USD into a USD reporting total, with a rate set the finance team controls.

**Approach.** The app owns the rate map (`term = base × factor`, USD per unit here). Convert each row, then sum — and store which rate set was used.

```ts
import { Conversion, Money } from "@eristack/money";

// USD per 1 unit of base — from your treasury table, not from the library
const usdRates: Record<string, string> = {
  EUR: "1.0850",
  IDR: "0.000064",
  JPY: "0.0066",
};

function toUsd(amount: Money): Money {
  const code = amount.currency.currencyCode;
  if (code === "USD") return amount;
  const factor = usdRates[code];
  if (!factor) throw new Error(`No USD rate configured for ${code}`);
  return amount.with(Conversion.of({ base: code, term: "USD", factor }));
}

const rows = [
  Money.of("1200.00", "EUR"),
  Money.of("18500000", "IDR"),
  Money.of("450000", "JPY"),
  Money.of("990.00", "USD"),
];

const inUsd = rows.map(toUsd);
// [1302.00, 1184.00, 2970.00, 990.00]

const reportTotal = Money.sum(inUsd, "USD"); // 6446.00
```

Decisions you still own:

- **Rate date.** Closing rate, invoice-date rate, or average rate — the `timestamp` on a rate is metadata the library never inspects.
- **Convert-then-sum vs sum-then-convert.** They can differ by cents. Pick one per report and keep it stable across periods.
- **Never chain** `IDR → USD → EUR`. Get a direct rate for each pair you report in.
- **Store originals.** Keep the transaction-currency amount plus the factor used; converted values are derived and reproducible. See [conversion](./conversion.md#round-trip-loss-is-real-and-expected).

## Inclusive tax round-trip

**Problem.** A consumer-facing price of `100.00 USD` includes 11% tax. You need the net and the tax portion, and the two must add back to the displayed gross.

**Approach.** Derive one value with a tax operator and the other by subtraction — never round both independently and hope.

```ts
import { Money, Rounding, Tax } from "@eristack/money";

const round = Rounding.currencyDefault();
const gross = Money.of("100.00", "USD");

const net = gross.with(Tax.netFromInclusive("11")).with(round); // 90.09
const tax = gross.subtract(net);                                // 9.91

net.add(tax).isEqualTo(gross); // true — by construction
```

`Tax.extractFromInclusive("11")` computes the tax portion directly (`9.91` here, same value):

```ts
gross.with(Tax.extractFromInclusive("11")).with(round); // 9.91
```

It agrees at `100.00`, but the derive-one-then-subtract form is the safer default because it can never drift. On an awkward gross it matters:

```ts
const odd = Money.of("99.99", "USD");
const oddNet = odd.with(Tax.netFromInclusive("11")).with(round);       // 90.08
const oddTaxExtracted = odd.with(Tax.extractFromInclusive("11")).with(round); // 9.91

oddNet.add(oddTaxExtracted).toString(); // 99.99 USD — ties out here
odd.subtract(oddNet).toString();        // 9.91 USD — guaranteed to tie out
```

Going the other direction (net → gross) uses the exclusive operator:

```ts
const back = oddNet.with(Tax.onExclusive("11")).with(round); // 9.91
oddNet.add(back).toString(); // 99.99 USD
```

Rate strings are **percent points** — `"11"` is 11%, `"0.11"` would be 0.11%. And the rate is opaque: there is no jurisdiction engine, no exemption logic, and no rounding rule imposed by tax law. Your tax service supplies the number; this library does the arithmetic.

## Register a custom currency or unit

**Problem.** Loyalty points, store credit, or an internal unit that ISO 4217 does not cover.

**Approach.** Register a `CurrencyUnit` once at startup, before any amount in that unit is constructed.

```ts
import { Money, Monetary } from "@eristack/money";

Monetary.registerCurrency({
  currencyCode: "PTS",
  numericCode: 0,          // no ISO numeric code — 0 or a private range
  defaultFractionDigits: 0, // whole points only
});

const balance = Money.of("1500", "PTS");
balance.add(Money.of("250", "PTS")); // 1750 PTS
balance.allocate(4);                 // [375, 375, 375, 375]
```

Registration is process-global and replaces any existing unit under the same code (the previous unit is returned). Call it during bootstrap — in tests, a `beforeAll` in your setup file, so every worker sees the same registry.

**Fraction digits drive everything downstream:**

| `defaultFractionDigits` | Storage | `Rounding.currencyDefault()` | `Money.ofMinor` | `allocate` |
| --- | --- | --- | --- | --- |
| `0` – `8` | Exact `bigint` minor units when it fits | Rounds to that scale | Works | Works |
| `-1` | Decimal path | Throws | Throws | Throws |

A high-precision unit is fine as long as the scale is fixed:

```ts
Monetary.registerCurrency({
  currencyCode: "XBT",
  numericCode: 0,
  defaultFractionDigits: 8,
});

Money.ofMinor(123456789n, "XBT").toString(); // 1.23456789 XBT
```

Use `-1` only for genuinely scale-less units, and expect to pass explicit scales everywhere:

```ts
Monetary.registerCurrency({
  currencyCode: "XPT",
  numericCode: 0,
  defaultFractionDigits: -1,
});

const raw = Money.of("1.23456789", "XPT");
raw.roundTo(4, "HALF_EVEN"); // explicit scale required — no currency default exists
```

See [currency](./currency.md) for lookup helpers and [gotchas](./gotchas.md#scale--1-currencies-cannot-use-currency-default-helpers) for the failure modes.

## Persist and reload

```ts
import { Money, moneyFromJSON, moneyToJSON } from "@eristack/money";

const payload = moneyToJSON(total); // { currency: "USD", amount: "430.35" }
await db.insert(invoices).values(payload);

const reloaded = moneyFromJSON(payload);
```

`moneyFromJSON` validates the shape and throws `ParseError` on anything that is not `{ currency: string, amount: string }` — including a JSON number amount, which is the failure mode you most want caught at the boundary. Details in [serialization](./serialization.md).

## See also

- [Advanced arithmetic](./advanced-arithmetic.md) — totals, percentages, tax and discount operators
- [Allocate & split](./allocate.md) — remainder behavior in depth
- [Currency conversion](./conversion.md) — rate semantics and round-trip loss
- [Gotchas](./gotchas.md) — the mistakes these recipes are designed to avoid
