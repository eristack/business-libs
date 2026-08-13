---
title: Concepts
description: Chains, equation, snapshots, meta
sidebar_position: 3
---

# Concepts

## chainId

Opaque stream key. One chain = one ordered history. Capabilities encode domain
keys:

```text
stock:{locationId}:{lotId}:{owner}
fin:{accountId}:{currency}
val:qty:{product}:{lot}:{currency}
val:value:{product}:{lot}:{currency}
```

## Balance equation

```text
closing = opening + in − out + adjustment
```

All amounts are **decimal strings**. The core uses `decimal.js` so you never
accumulate float error in the ledger math.

| Field | Typical use |
| --- | --- |
| `inAmount` | Receipt, debit, value increase |
| `outAmount` | Issue, credit, value decrease |
| `adjustment` | Inventory count variance, rounding fix |

Signs: pass **non-negative** magnitudes for in/out; put signed corrections in
`adjustment` when needed.

## Append semantics

1. Load tip for `chainId` (or start genesis).
2. Genesis requires `openingBalance`.
3. Later entries inherit `openingBalance = tip.closingBalance`.
4. Compute closing; assert equation.
5. Hash payload; set `prevHash` to tip’s `entryHash`.
6. Persist entry + upsert snapshot.

## Snapshots

`{ chainId, sequence, balance, entryHash, updatedAt }` — fast on-hand reads.
Trust a snapshot for UI; run `verify` / `check` for audits and before period
close.

## meta

Optional `Record<string, unknown>` included in the hash. Put locationId,
accountId, picks, etc. here so tampering domain context also fails verify.
