# @eristack/percent

Percent and basis-point ratios as strings — tax, discount, and markup rates without float literals.

```ts
import { parsePercent, percentOf } from "@eristack/percent";

percentOf("100", parsePercent("10%")); // "10"
```

Docs: [packages/primitive/percent/docs/index.md](./docs/index.md)
