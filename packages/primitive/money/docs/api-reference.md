---
title: API reference
description: Public exports cheat-sheet for @eristack/money
sidebar_position: 13
---

# API reference

Hand-maintained cheat-sheet of the public surface. Signatures are simplified.

## Core

| Export | Kind | Summary |
| --- | --- | --- |
| `Money` | class | Immutable adaptive monetary amount |
| `Money.of(amount, currency)` | static | Create from string / integer / bigint |
| `Money.ofMinor(minor, currency)` | static | Create from minor units |
| `Money.zero(currency)` | static | Zero amount |
| `Money.fromJSON(json)` | static | Rehydrate from JSON |
| `Money.sum` / `min` / `max` / `average` | static | Same-currency aggregates |
| `Money.ratio` / `percentRatio` | static | Dimensionless ratio strings |
| `amount.percentOf` / `plusPercent` / `minusPercent` | method | Percent helpers (`"7"` = 7%) |
| `MonetaryAmount` | interface | Amount contract |
| `NumberValue` | class | Numeric view |
| `Monetary` | object | Currency + factory accessor |

## Currency

| Export | Summary |
| --- | --- |
| `CurrencyUnit` | `{ currencyCode, numericCode, defaultFractionDigits }` |
| `getCurrency` / `tryGetCurrency` | Lookup |
| `registerCurrency` / `removeCurrency` | Custom units |
| `getCurrencies` | List registered units |

## Operators

| Export | Summary |
| --- | --- |
| `Rounding.of(scale, mode?)` | Rounding operator |
| `Rounding.currencyDefault(currency?, mode?)` | Currency-scale rounding |
| `Percent.of(percent)` | Percent-of-amount operator |
| `Discount.ofPercent` / `Markup.ofPercent` | Discount / markup operators |
| `Tax.onExclusive` / `netFromInclusive` / `extractFromInclusive` | Tax helpers |
| `Conversion.of(rate, mode?)` | FX operator |
| `exchangeRate(input)` | Build `ExchangeRate` |
| `MonetaryOperator` / `MonetaryQuery` | Extension contracts |

## Format & JSON

| Export | Summary |
| --- | --- |
| `formatMoney(amount, locale\|options)` | Intl format |
| `parseMoney(text, currency, locale?)` | UI parse |
| `moneyToJSON` / `moneyFromJSON` | Safe interchange |

## Errors

`MoneyError`, `CurrencyMismatchError`, `UnknownCurrencyError`, `ArithmeticError`, `ParseError`
