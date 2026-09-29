---
title: Getting started
description: Rates live in app tables until @eristack/fx-table ships.
---

# Getting started

```bash
pnpm add @eristack/currency-pair @eristack/money
```

```ts
import { normalizeCurrencyPair, formatPairKey, invertPair } from "@eristack/currency-pair";

const pair = normalizeCurrencyPair("usd", "idr");
formatPairKey(pair); // "USD/IDR"
invertPair(pair); // IDR/USD
```

Rates live in app tables until `@eristack/fx-table` ships.
