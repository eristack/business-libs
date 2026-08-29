# Zod

Peer `zod ^4`.

```bash
pnpm add @eristack/percent @eristack/percent/zod zod
```

```ts
import { percentSchema, percentRatioSchema } from "@eristack/percent/zod";

percentSchema.parse({ ratio: "0.11" });
percentRatioSchema.parse("0.075");
```

Validate shape on wire JSON; use `parsePercent` for `"11%"` human input forms.

## Type

`PercentJson` — `{ ratio: string }` for OpenAPI schemas.
