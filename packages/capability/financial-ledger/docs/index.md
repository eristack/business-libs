---
title: Overview
description: Hash-chained GL by account and currency
---

# @eristack/financial-ledger

Accounting ledger on `@eristack/hash-chained-ledger`, keyed by **accountId +
currency**, amounts via `@eristack/money`.

## Default = Drizzle

```ts
import { createFinancialLedger } from "@eristack/financial-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/financial-ledger/drizzle";
import { Money } from "@eristack/money";

const tables = createHashChainedLedgerTables("pgsql");
const fin = createFinancialLedger({
  store: createDrizzleLedgerStore({ db, tables }),
});

await fin.post({
  accountId: "1000",
  currency: "USD",
  openingBalance: Money.of("0", "USD"),
  inAmount: Money.of("100.00", "USD"),
  entryType: "journal",
  entryTypeId: "jv-1",
});
```

## vs stock / valuations

| Package | Key | Amount meaning |
| --- | --- | --- |
| stock-movement | location + lot | quantity |
| financial-ledger | account + currency | money |
| valuations | product + lot | qty + cost value |

## Next

- [Getting started](./getting-started.md)
- [Concepts](./concepts.md)
- [Recipes](./recipes.md)
