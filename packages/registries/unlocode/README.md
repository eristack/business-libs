# @eristack/unlocode

UN/LOCODE normalization for ports and trade locations — five-character codes with ISO 3166 country validation.

```ts
import { normalizeUnlocode, formatUnlocodeDisplay } from "@eristack/unlocode";

normalizeUnlocode("ID JKT"); // "IDJKT"
formatUnlocodeDisplay("SGSIN"); // "SG SIN"
```

Docs: [packages/registries/unlocode/docs/index.md](./docs/index.md)
