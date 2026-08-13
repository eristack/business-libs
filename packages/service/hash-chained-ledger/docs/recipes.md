---
title: Recipes
description: Multi-entry posts, audit jobs, custom chain ids
sidebar_position: 6
---

# Recipes

## Open a chain with a known opening

```ts
await ledger.append({
  chainId,
  openingBalance: "1250.00",
  inAmount: "0",
  entryType: "open",
  entryTypeId: "open-2026",
});
```

## Post in + out in one business event

Two appends share the same `entryTypeId` if one document drives both sides
(transfer out of A, into B = two chains).

```ts
await ledger.append({
  chainId: fromChain,
  outAmount: qty,
  entryType: "transfer",
  entryTypeId: transferId,
});
await ledger.append({
  chainId: toChain,
  inAmount: qty,
  entryType: "transfer",
  entryTypeId: transferId,
  openingBalance: /* only if toChain is new */,
});
```

## Nightly integrity job

```ts
for (const chainId of activeChains) {
  const result = await ledger.check(chainId);
  if (!result.ok) await alertTamper(chainId, result);
}
```

## Adjustment without inventing floats

```ts
await ledger.append({
  chainId,
  adjustment: "-0.01", // count variance
  entryType: "count-adj",
  entryTypeId: countId,
});
```
