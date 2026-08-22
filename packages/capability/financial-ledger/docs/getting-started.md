---
title: Getting started
description: Post Money amounts to an account chain
---

# Getting started

```bash
pnpm add @eristack/financial-ledger @eristack/money
pnpm add drizzle-orm
```

```ts
import { createFinancialLedger } from "@eristack/financial-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/financial-ledger/drizzle";
import { Money } from "@eristack/money";

const fin = createFinancialLedger({
  store: createDrizzleLedgerStore({
    db,
    tables: createHashChainedLedgerTables("pgsql"),
  }),
});

await fin.post({
  accountId: "1000",
  currency: "USD",
  openingBalance: "0",
  inAmount: Money.of("100.00", "USD"),
  entryType: "journal",
  entryTypeId: "jv-1",
});

await fin.post({
  accountId: "1000",
  currency: "USD",
  outAmount: "25.50",
  entryType: "journal",
  entryTypeId: "jv-2",
});

await fin.verify("1000", "USD");
```

`inAmount` / `outAmount` / `adjustment` accept `Money` or decimal strings.
Currency must match the chain.

## Read paths (hydrate)

Hashed ledger payloads stay decimal **strings**. For UI and reports, hydrate on read:

```ts
import {
  createFinancialLedger,
  hydrateLedgerEntry,
  hydrateLedgerSnapshot,
} from "@eristack/financial-ledger";

const entries = await fin.list("1000", "USD");
const hydrated = entries.map((e) => hydrateLedgerEntry(e, "USD"));
expect(hydrated[0].closingBalance.toJSON().amount).toBe("100");

const snap = await fin.snapshot("1000", "USD");
if (snap) {
  const { balance } = hydrateLedgerSnapshot(snap, "USD");
}
```

Do not change SQL ledger column types — only map strings ↔ `Money` at boundaries.

Unit tests may import `createMemoryLedgerStore` from
`@eristack/hash-chained-ledger` — never as the deployed default.
