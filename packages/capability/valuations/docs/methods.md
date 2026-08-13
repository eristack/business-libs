---
title: Methods
description: FIFO through specific identification
---

# Methods

Pass `method` into `createValuationEngine({ method, … })`. Issue order and unit
cost follow the table below.

| Method | Issue order / cost |
| --- | --- |
| `fifo` | Oldest `receivedAt` first |
| `lifo` | Newest first |
| `fefo` | Earliest `expiresAt` (then `receivedAt`) |
| `hifo` | Highest unit cost first |
| `lofo` | Lowest unit cost first |
| `movingAverage` | Single blended layer; receive updates average |
| `weightedAverage` | Same engine path as moving average (perpetual blend) |
| `standardCost` | Receive stores `standardUnitCost` (or `unitCost`) on layers |
| `specificIdentification` | Issue requires `layerId` |

## Choosing a method

| Need | Prefer |
| --- | --- |
| Matching physical pick order / expiry | `fifo` / `fefo` |
| Tax / local GAAP LIFO | `lifo` (policy choice — not automatic compliance) |
| Smooth COGS | `movingAverage` / `weightedAverage` |
| Fixed BOM / std cost | `standardCost` |
| Serial / consignment pick | `specificIdentification` |

## Pure helpers

`receiveIntoLayers` / `issueFromLayers` run the same ordering rules without the
engine when you only need layer math (simulators, unit tests). Production apps
still persist via the engine + Drizzle stores.

## Switching mid-stream

Changing method for an existing key mid-life mixes layer order with prior
policy. Prefer a new valuation key / period close rather than flipping `method`
on a live open-layer set.
