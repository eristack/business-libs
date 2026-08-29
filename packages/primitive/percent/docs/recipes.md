# Recipes

## Invoice VAT line

```ts
import { parsePercent, percentOf } from "@eristack/percent";
import { Money } from "@eristack/money";

const vat = parsePercent({ kind: "basisPoints", value: row.vatBps });
const taxStr = percentOf(subtotal.toDecimal(), vat);
const tax = Money.of(taxStr, subtotal.currency);
```

## Header discount

```ts
import { minusPercent, parsePercent } from "@eristack/percent";

const discounted = minusPercent(lineTotal, parsePercent("15%"));
```

## QUPS modifier rate

Pass ratio string into modifier config; parse once at document load:

```ts
const modifierRate = parsePercent(taxCode.rate); // "10%" from master
// apply in line calculator before money wrap
```

## API: accept human input

```ts
const rate = parsePercent(req.body.rateLabel); // "7.5%"
await db.update(taxCodes).set({ ratio: rate.ratio });
```

## Display bps in admin grid

```ts
import { toBasisPoints, parsePercent } from "@eristack/percent";

toBasisPoints(parsePercent(row.ratio)); // show in grid column
```
