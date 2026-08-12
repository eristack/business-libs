---
title: ERP recipes
description: Common invoice, tax, allocation, and multi-currency flows
sidebar_position: 12
---

# ERP recipes

## Invoice line → discount → tax → total

```ts
import { Discount, Money, Rounding, Tax } from "@eristack/money";

const round = Rounding.currencyDefault();

const qty = 3;
const unitPrice = Money.of("49.90", "USD");
const line = unitPrice.multiply(qty); // 149.70
const net = line.with(Discount.ofPercent("5")).with(round);
const tax = net.with(Tax.onExclusive("11")).with(round);
const total = Money.sum([net, tax]).with(round);
```

## Split payment across open invoices

```ts
const payment = Money.of("1000.00", "USD");
// ratios from open balances
const shares = payment.allocateByRatios([250, 400, 350]);
```

## Multi-currency document

```ts
import { Conversion, Money, Rounding } from "@eristack/money";

const local = Money.of("1500000", "IDR");
const reporting = local.with(
  Conversion.of({ base: "IDR", term: "USD", factor: "0.000067" }),
).with(Rounding.currencyDefault("USD"));
```

## Persist then reload

```ts
const payload = total.toJSON();
// save payload in DB / API

const reloaded = Money.fromJSON(payload);
```
