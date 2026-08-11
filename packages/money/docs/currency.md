---
title: Currency
description: ISO 4217 currency units and custom currency registration
sidebar_position: 4
---

# Currency

## ISO 4217

```ts
import { Monetary } from "@eristack/money";

const usd = Monetary.getCurrency("USD");
usd.currencyCode; // "USD"
usd.numericCode; // 840
usd.defaultFractionDigits; // 2

Monetary.getCurrency("JPY").defaultFractionDigits; // 0
Monetary.getCurrency("KWD").defaultFractionDigits; // 3
```

Unknown codes throw `UnknownCurrencyError`.

## Custom currencies

Register points, store credit, or other units:

```ts
Monetary.registerCurrency({
  currencyCode: "PTS",
  numericCode: -1,
  defaultFractionDigits: 0,
});

const points = Money.of("150", "PTS");
```

Use `defaultFractionDigits: -1` for units without a fixed minor scale (stored on the decimal path).

## Listing

```ts
const all = Monetary.getCurrencies();
Monetary.isCurrencyAvailable("EUR"); // true
```
