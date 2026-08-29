---
name: financial-ledger-adapters
description: >
  @eristack/financial-ledger/drizzle: createHashChainedLedgerTables +
  createDrizzleLedgerStore for durable GL chains on Postgres (Vercel).
metadata:
  type: adapter
  library: "@eristack/financial-ledger"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/capability/financial-ledger/docs/getting-started.md"
---

# Financial ledger adapters

```ts
import { createFinancialLedger } from "@eristack/financial-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/financial-ledger/drizzle";
import { Money } from "@eristack/money";

const tables = createHashChainedLedgerTables("pgsql");
const store = createDrizzleLedgerStore({ db, tables });
const ledger = createFinancialLedger({ store });

await ledger.post({
  chainId: { accountId: "cash", currency: "USD" },
  inAmount: Money.of("100", "USD"),
  entryType: "payment",
  entryTypeId: "pay_1",
});
```
