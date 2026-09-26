---
name: unlocode-core
description: >
  @eristack/unlocode UN/LOCODE normalization for ports and trade locations.
  Depends on @eristack/iso-3166 for country prefix. Use for B/L, forwarding,
  and logistics locode fields — not for tenant port masters or full UN datasets.
metadata:
  type: core
  library: "@eristack/unlocode"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/registries/unlocode/docs/getting-started.md"
---

# UN/LOCODE registry

```ts
import {
  normalizeUnlocode,
  parseUnlocode,
  formatUnlocodeDisplay,
} from "@eristack/unlocode";
```

- **Peer:** `pnpm add @eristack/unlocode @eristack/iso-3166` — iso-3166 is required at runtime.
- **`normalizeUnlocode`** — `ID JKT` → `IDJKT`; validates country via iso-3166
- **`parseUnlocode`** — `{ country, location, code }`
- **`isSampleUnlocode`** — demo port list only; not full UN registry
- App owns **which ports are active**; reference-data later for bulk UN files

Zod: `@eristack/unlocode/zod` — `unlocodeSchema`
