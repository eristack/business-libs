# Getting started

## Install

```bash
pnpm add @eristack/unlocode @eristack/iso-3166
```

(`iso-3166` is a runtime dependency of `unlocode`.)

## Normalize port code

```ts
import { normalizeUnlocode, parseUnlocode } from "@eristack/unlocode";

const pol = normalizeUnlocode("id jkt"); // "IDJKT"
const { country, location } = parseUnlocode(pol); // SG-style: country "ID", location "JKT"
```

## Display

```ts
import { formatUnlocodeDisplay } from "@eristack/unlocode";

formatUnlocodeDisplay("USNYC"); // "US NYC"
```

## Strict demo list (optional)

`isSampleUnlocode` checks a **small shipped sample** (major ports) — not the full UN registry:

```ts
import { isSampleUnlocode } from "@eristack/unlocode";

isSampleUnlocode("IDJKT"); // true
isSampleUnlocode("IDZZZ"); // false (format may still pass normalizeUnlocode if country valid)
```

Use **`normalizeUnlocode`** for shape + country; use **reference-data** later when you need “exists in official UN list.”

## Zod

```ts
import { unlocodeSchema } from "@eristack/unlocode/zod";

unlocodeSchema.parse("SG SIN"); // "SGSIN"
```

## App master pattern

```text
Table port_sites (
  locode text not null,  -- store normalized IDJKT
  label text,
  is_active boolean
)
```

Validate on write with `normalizeUnlocode`; list filters via `@eristack/data-grid`.
