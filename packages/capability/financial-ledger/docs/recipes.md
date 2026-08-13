---
title: Recipes
description: Double-entry style posts, FX, period close
---

# Recipes

## Simple journal (cash ← AR)

```ts
const jv = "jv-100";
await fin.post({
  accountId: "1000",
  currency: "USD",
  inAmount: "50",
  entryType: "journal",
  entryTypeId: jv,
  openingBalance: "0", // genesis only
});
await fin.post({
  accountId: "1100",
  currency: "USD",
  outAmount: "50",
  entryType: "journal",
  entryTypeId: jv,
});
```

Same `entryTypeId` on both legs ties the journal together for reporting.

## Money-typed posts

```ts
import { Money } from "@eristack/money";

await fin.post({
  accountId: "1000",
  currency: "USD",
  inAmount: Money.of("100.00", "USD"),
  entryType: "journal",
  entryTypeId: "jv-1",
  openingBalance: Money.of("0", "USD"),
});
```

## FX

Keep one chain per currency. Convert with `@eristack/money` + your rate source,
then post converted amounts into the **target** currency chain. Do not mix USD
and EUR on `fin:1000:USD`.

## Period close

```ts
await fin.verify("1000", "USD");
const snap = await fin.snapshot("1000", "USD");
// snap.balance → trial balance input
```

Fail closed on `ChainTamperedError` before locking the period.
