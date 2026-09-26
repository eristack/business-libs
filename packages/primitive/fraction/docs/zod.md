# Zod

Optional peer: `zod` ^4.

```ts
import { fractionInputSchema, fractionSchema } from "@eristack/fraction/zod";

fractionInputSchema.parse("1 1/2"); // { num: "3", den: "2" }

fractionSchema.parse({ num: "6", den: "9" }); // normalizes to { num: "2", den: "3" }
```

Validate HTTP JSON at the boundary, then use core functions for arithmetic.
