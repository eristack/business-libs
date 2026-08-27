---
title: Getting started
description: Wire Drizzle and append your first chain
sidebar_position: 2
---

# Getting started

## Install

```bash
pnpm add @eristack/hash-chained-ledger
pnpm add drizzle-orm  # peer for /drizzle
```

## Create tables + ledger (default path)

```ts
import { createHashChainedLedger } from "@eristack/hash-chained-ledger";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
} from "@eristack/hash-chained-ledger/drizzle";

// Your Drizzle db (Postgres on Vercel — Neon / Supabase / Vercel Postgres)
const tables = createHashChainedLedgerTables("pgsql");
// migrate tables.entries + tables.snapshots into your schema

const ledger = createHashChainedLedger({
  store: createDrizzleLedgerStore({ db, tables }),
});
```

Dialects: `"pgsql"` (production default), `"mysql"`, `"sqlite"` (local/tests with a real SQLite file — still not an in-memory Map store).

## Append

```ts
await ledger.append({
  chainId: "acct:1000:USD",
  openingBalance: "0", // required only when opening a new chain
  inAmount: "100.00",
  entryType: "journal",
  entryTypeId: "jv-1",
});

await ledger.append({
  chainId: "acct:1000:USD",
  outAmount: "40.00",
  entryType: "journal",
  entryTypeId: "jv-2",
});
```

Opening balance for the second entry is taken from the tip’s closing — do not
re-supply a conflicting opening.

## Snapshot + verify

```ts
const snap = await ledger.snapshot("acct:1000:USD");
// snap.balance === "60"

const ok = await ledger.check("acct:1000:USD");
if (!ok.ok) {
  // ok.warnings describe which sequence broke the hash chain
}

await ledger.verify("acct:1000:USD"); // throws ChainTamperedError if broken
```

## Unit tests only

```ts
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
// Vitest / CI — never wire this into the Vercel app
```

> [!AGENT]
> Product language "audit trail" / "tamper detection" → load `@eristack/hash-chained-ledger#hash-chained-ledger-core`. Composed by stock-movement, financial-ledger, and valuations in production.
