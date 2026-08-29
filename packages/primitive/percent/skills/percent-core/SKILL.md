---
name: percent-core
description: >
  @eristack/percent ratio strings, basis points, percentOf/plus/minus for tax and
  discounts without float literals. Use before @eristack/money rounding at boundaries.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/primitive/percent/docs/index.md
---

# @eristack/percent

Rates as **decimal ratio strings** — `"0.11"` for 11%, basis points `"1100"`.

```ts
import { parsePercent, percentOf, fromBasisPoints } from "@eristack/percent";

const vat = parsePercent("10%");
percentOf("100", vat); // "10"
fromBasisPoints("1100"); // 11%
```

## Checklist

1. Master data: store bps or ratio string — parse with `parsePercent` / `fromBasisPoints`.
2. Line math on strings; wrap in `@eristack/money` + round at invoice/ledger boundary.
3. Do not confuse with money `percentOf(m, "7")` (7 percent points) — convert ratio explicitly.
4. Compound tax/discount stacks are **app rules** — `addPercents` is simple sum only.
5. Validate wire JSON with `@eristack/percent/zod`; human `"11%"` input via `parsePercent`.

## Do not

- Pass JS float literals (`0.11`) as domain rates
- Assume statutory compound tax from `addPercents` alone
