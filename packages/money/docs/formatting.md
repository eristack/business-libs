---
title: Formatting
description: Locale-aware format and parse helpers
sidebar_position: 9
---

# Formatting

## Format

```ts
import { formatMoney, Money } from "@eristack/money";

formatMoney(Money.of("19.99", "USD"), "en-US");
// "$19.99"

formatMoney(Money.of("19.99", "USD"), {
  locale: "de-DE",
  currencyDisplay: "code",
});
```

Formatting uses `Intl.NumberFormat` and is intended for **display**. For very large magnitudes, prefer `amount.amountString()` plus your own presentation layer.

## Parse

```ts
import { parseMoney } from "@eristack/money";

parseMoney("$19.99", "USD", "en-US");
```

Parsing is best-effort for UI input. For APIs and persistence, use [JSON serialization](./serialization.md) instead of localized strings.
