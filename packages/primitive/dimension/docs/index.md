# @eristack/dimension

**Length × width × height** as decimal strings — normalize once, compute cubic volume without float literals.

## Exports

| Entry | Role |
| --- | --- |
| `@eristack/dimension` | `normalizeDimension`, `dimensionVolume`, `formatDimension` |
| `@eristack/dimension/zod` | `dimensionSchema` for APIs |

## Collaboration

No hard dependency on `@eristack/uom` — pass a **unit label** string from your uom master if needed. Compose with stock/logistics at the app boundary; load `#party-and-platform-compose` for Wave 13 measure patterns.

## Next

- [Getting started](./getting-started.md)
