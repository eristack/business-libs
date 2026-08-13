# Hash-chained ledger family

## Goal

Shared **hash-chained ledger** service as the base for inventory, valuation, and
accounting ledgers. Production persistence is Drizzle + Postgres (Vercel-safe);
memory stores are tests only.

## Packages

| Package | Layer | Role |
| --- | --- | --- |
| `@eristack/hash-chained-ledger` | service | Append-only entries + hash chain + verify/tamper |
| `@eristack/stock-movement` | capability | Qty ledger + locationId/lotId + location compose + snapshots |
| `@eristack/financial-ledger` | capability | Accounting ledger keyed by accountId (Money) |
| `@eristack/valuations` | capability | FIFO / LIFO / moving avg / standard / specific ID + cost ledger |

## Entry equation

```text
closing = opening + in - out + adjustment
```

Each entry carries `entryType` + `entryTypeId`, `prevHash` / `entryHash`, sequence.

## Decisions

- Amounts in the **service** ledger are **decimal strings** (qty or money).
- Financial capability wraps with `@eristack/money`.
- Locations are app-composed key/value parts → stable `locationId`.
- Snapshots cache last closing per chain for read without replay.
- `createMemory*Store` tests / site heroes only; Drizzle is the default everywhere else.
- Site heroes: `/hash-chained-ledger`, `/stock-movement`, `/financial-ledger`, `/valuations`.
- Valuations needs **both** ledger Drizzle store and `createDrizzleLayerStore`.
