---
title: Concepts
description: Chains, owner field, snapshots, transfers
---

# Concepts

## Chain key

```text
stock:{locationId}:{lotId}:{ownerId|_}
```

Built by `stockChainId`. Meta on each entry also stores location/lot/owner so
tampering domain context fails `verify` the same way as amount tampering.

| Part | Required | Meaning |
| --- | --- | --- |
| `locationId` | yes | Opaque id from `locationIdFromParts` (or your own stable id) |
| `lotId` | yes | Lot / batch / serial bucket |
| `ownerId` | no | Opaque namespace (SKU, product, tenant item, …) |

Missing `ownerId` uses `_` in the chain id — do not mix “no owner” and a real
owner for the same physical stock or you get two balances.

## Owner field

`ownerId` is **not** an ACL model and does not reserve stock. It only namespaces
the hash chain. Authorization stays in RBAC/ABAC/PBAC (or your app).

## Amounts

Quantity **decimal strings** only — never JS floats. Same balance equation as
the base ledger:

```text
closing = opening + in − out + adjustment
```

| Field | Typical stock use |
| --- | --- |
| `inAmount` | Receipt, transfer-in, production output |
| `outAmount` | Issue, transfer-out, scrap |
| `adjustment` | Cycle count variance |

## Snapshots vs verify

- `snapshot({ locationId, lotId, ownerId? })` — fast on-hand for UI/API.
- `verify` / `check` — rehash before stocktake close, period end, or when
  investigating discrepancies.

Trust the snapshot for reads; treat verify as the integrity gate.

## Persistence

Default production path is Drizzle via `@eristack/stock-movement/drizzle`
(re-exports hash-chained ledger tables/store). `createMemoryLedgerStore` from
`@eristack/hash-chained-ledger` is **Vitest / browser demos only** — not Vercel.
