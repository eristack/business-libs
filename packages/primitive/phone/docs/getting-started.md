# Getting started

```bash
pnpm add @eristack/phone
```

```ts
import { normalizeE164 } from "@eristack/phone";

normalizeE164("+1 (415) 555-0100"); // "+14155550100"
```

No country inference in v0 — callers supply full international numbers.
