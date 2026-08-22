---
name: financial-ledger-core
description: >
  @eristack/financial-ledger: createFinancialLedger post/list/snapshot/verify by
  accountId+currency with @eristack/money. Default store is Drizzle — memory is
  tests only.
metadata:
  type: core
  library: "@eristack/financial-ledger"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/financial-ledger/docs/concepts.md"
  - "eristack/business-libs:packages/capability/financial-ledger/docs/getting-started.md"
---

# Financial ledger core

GL stream key: `fin:{accountId}:{currency}`. Amounts via Money or decimal strings.

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
  openingBalance: Money.of("0", "USD"),
  inAmount: Money.of("100.00", "USD"),
  entryType: "journal",
  entryTypeId: "jv-1",
});
await fin.verify("1000", "USD");
```

**Read path:** ledger stores decimal strings in the hash. Hydrate for UI:

```ts
import { hydrateLedgerEntry } from "@eristack/financial-ledger";

const entries = await fin.list("1000", "USD");
entries.map((e) => hydrateLedgerEntry(e, "USD").closingBalance);
```

Do **not** default to `createMemoryLedgerStore` in apps. Do **not** change hashed amount column types to numeric.
