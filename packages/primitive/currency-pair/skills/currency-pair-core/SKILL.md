---
name: currency-pair-core
description: >
  @eristack/currency-pair normalizeCurrencyPair, formatPairKey ("USD/IDR"), invertPair,
  currencyPairSchema — validate base/quote against the money registry and key FX rate
  tables canonically. No rates or conversion here (that is @eristack/money Conversion).
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/currency-pair"
sources:
  - packages/primitive/currency-pair/docs/getting-started.md
---

# @eristack/currency-pair

Two different, registered ISO codes → one canonical key. Rates live in an app table keyed by that string.

```ts
import { normalizeCurrencyPair, formatPairKey, invertPair } from "@eristack/currency-pair";
import { currencyPairSchema } from "@eristack/currency-pair/zod";

const pair = normalizeCurrencyPair("usd", "idr");   // { base: "USD", quote: "IDR" } | throws CurrencyPairParseError
formatPairKey(pair);                                // "USD/IDR"  → fx_rates.pair_key
invertPair(pair);                                   // { base: "IDR", quote: "USD" }
currencyPairSchema.parse({ base, quote });          // zod wire validation
```

## Checklist

1. Store `formatPairKey(pair)` as a single `text` column with a unique index (`pair_key, as_of`).
2. Validate query/body params with `currencyPairSchema` → 400 on `CurrencyPairParseError` (`code: "CURRENCY_PAIR_PARSE_ERROR"`).
3. Convert with `Money.of(amount, pair.base).with(Conversion.of({ base: pair.base, term: pair.quote, factor: rate }))` from `@eristack/money`.
4. Try `invertPair` before 404 when vendors quote one direction.

## Do not

- Store rates, fetch feeds, or do decimal math here — app table + `@eristack/money`.
- Build keys by string concatenation; casing/order drift is the bug this package removes.
- Expect unregistered currency codes to pass — register them in `@eristack/money` first.
