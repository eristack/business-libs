# Basis points

Finance and ERP tables often store **basis points (bps)** — 1 bps = 0.01%.

| Display | bps | ratio |
| --- | --- | --- |
| 11.00% | `1100` | `0.11` |
| 7.50% | `750` | `0.075` |
| 0.125% | `12.5` → use string `12.5` or store ratio | `0.00125` |

## API

```ts
import { fromBasisPoints, toBasisPoints, parsePercent } from "@eristack/percent";

fromBasisPoints("1100"); // { ratio: "0.11" }
toBasisPoints(parsePercent("11%")); // "1100"
```

## Drizzle column

Store bps as `numeric` or text in SQL; read as string into `fromBasisPoints`:

```ts
const rate = fromBasisPoints(row.vatBps);
```

## Precision

`toBasisPoints` uses `toFixed(0)` — suitable for whole bps. Sub-bps precision: store ratio string directly instead of bps.

## VAT / withholding tables

```ts
const rates = {
  standard: fromBasisPoints("2000"), // 20%
  reduced: fromBasisPoints("550"),   // 5.5%
};
```

Keep table in app DB; percent package only parses/applies.
