---
title: Overview
description: Validate base/quote currency pairs against the money registry and produce canonical "USD/IDR" keys — no rates.
---

# @eristack/currency-pair

A `CurrencyPair` is `{ base, quote }` — two **different**, **known** ISO 4217 codes. This package makes sure of that and gives you one canonical string key (`"USD/IDR"`) so FX rate tables, caches, and API params never disagree on casing, order, or spelling.

It deliberately knows **nothing about rates**. Rates are app data (a Drizzle table, a vendor feed); this package only names the pair the rate belongs to.

## Use it when

- Keying an FX rate table or cache: `rates[formatPairKey(pair)]`.
- Validating `?base=usd&quote=idr` query params before hitting the database.
- Inverting a quoted pair to look up the reverse direction.

## Not for

- Converting money — `Conversion.of(rate)` in `@eristack/money` (`#money-ledger`).
- Storing or fetching rates — app-owned table/feed.
- Currency metadata (minor units, symbols) — `@eristack/money` registry (`isCurrencyAvailable`, `Currency`).

## Install

```bash
pnpm add @eristack/currency-pair @eristack/money
# optional wire validation
pnpm add zod
```

Peers: `@eristack/money ^0.3.0` (currency registry), `zod ^4` only for `@eristack/currency-pair/zod`.

## 30-second example

```ts
import { normalizeCurrencyPair, formatPairKey, invertPair } from "@eristack/currency-pair";

const pair = normalizeCurrencyPair(" usd ", "idr"); // { base: "USD", quote: "IDR" }
formatPairKey(pair);                                // "USD/IDR"
invertPair(pair);                                   // { base: "IDR", quote: "USD" }

normalizeCurrencyPair("USD", "USD"); // throws CurrencyPairParseError "base and quote must differ"
normalizeCurrencyPair("USD", "XXX"); // throws CurrencyPairParseError "Unknown currency code XXX"
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeCurrencyPair` | `(base: string, quote: string) => CurrencyPair` | Trims, upper-cases, requires `/^[A-Z]{3}$/`, checks `isCurrencyAvailable` from `@eristack/money`, rejects `base === quote`. |
| `formatPairKey` | `(pair: CurrencyPair) => string` | Re-normalizes, returns `"BASE/QUOTE"`. Safe to use as a Map key or DB unique column. |
| `invertPair` | `(pair: CurrencyPair) => CurrencyPair` | Re-normalizes, swaps. |
| `CurrencyPair` | `{ base: string; quote: string }` | Plain object — store as two `text` columns or one key column. |
| `CurrencyPairParseError` | `Error` with `code: "CURRENCY_PAIR_PARSE_ERROR"` | Thrown by all three functions. |
| `currencyPairSchema` | `z.ZodType<CurrencyPair>` from `./zod` | Accepts `{ base, quote }`, transforms via `normalizeCurrencyPair`. |

## Works with

- `@eristack/money` — after you fetch the rate for `formatPairKey(pair)`, convert with `Conversion.of({ base, term: quote, factor: rate })`.
- `@eristack/data-grid` — a pair key column filters/sorts as a plain string.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/currency-pair#currency-pair-core`
- Recipe: `currency-pair-fx-key`.

## Next

- [Getting started](./getting-started.md) — an FX rate table keyed by pair, with Zod-validated query params.
