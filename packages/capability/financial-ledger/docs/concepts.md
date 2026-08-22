---
title: Concepts
description: Account streams, Money, signs, period close
---

# Concepts

## Chain

```text
fin:{accountId}:{currency}
```

One stream per **account and currency**. Multi-currency charts = parallel chains
(e.g. `1000:USD` and `1000:EUR`). Do not store mixed currencies on one chain.

## Money amounts

`post` accepts `@eristack/money` `Money` or decimal strings for
`openingBalance` / `inAmount` / `outAmount` / `adjustment`. When you pass
`Money`, currency must match the chain’s currency or the call fails.

Internally the hash-chained service still stores **decimal strings** — Money is
the typed boundary for apps. Hashed payloads must stay text (changing types
invalidates chains). See [@eristack/money adapters](/docs/money/adapters)
§ hash-chained ledgers.

## Hydrate on read

List/snapshot APIs return decimal strings. Map to `Money` for UI and reports:

```ts
import {
  createFinancialLedger,
  hydrateLedgerEntry,
  hydrateLedgerSnapshot,
} from "@eristack/financial-ledger";

const entries = await fin.list("1000", "USD");
for (const entry of entries) {
  const { closingBalance, inAmount } = hydrateLedgerEntry(entry, "USD");
}

const snap = await fin.snapshot("1000", "USD");
if (snap) {
  const { balance } = hydrateLedgerSnapshot(snap, "USD");
}
```

`post()` still accepts `Money | string` and converts to decimal text before append.

## Sign convention

The library stores **magnitudes** in `in` / `out`. Your chart of accounts decides
whether “in” means debit for assets (or credit for liabilities). Keep that
mapping in the business layer.

Double-entry style: post both sides of a journal as two (or more) `post` calls
with the **same** `entryTypeId` so you can reconcile by document id later.

## Integrity

`verify(accountId, currency)` rehashes the chain. Run before period close and
after bulk imports. `snapshot` is for balances in UI; verify is for audit.

## Persistence

Default is Drizzle (`@eristack/financial-ledger/drizzle`). Memory ledger stores
exist only for unit tests / site hero demos — never as the deployed default on
Vercel.
