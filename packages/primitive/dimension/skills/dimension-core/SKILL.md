---
name: dimension-core
description: >
  @eristack/dimension normalizeDimension, dimensionVolume, formatDimension — L×W×H decimal
  strings (Wave 13 B1). Optional unit label; pair with uom in the app.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/primitive/dimension/docs/getting-started.md
---

# @eristack/dimension

```ts
import { normalizeDimension, dimensionVolume } from "@eristack/dimension";

const d = normalizeDimension({ length: "2", width: "3", height: "4" });
dimensionVolume(d); // "24.000000"
```

## Checklist

1. `normalizeDimension` on every write — positive finite decimal strings only.
2. Store **canonical** fixed strings from normalize (no JS number literals for sides).
3. `unit` is display/metadata — validate against `@eristack/uom` in the app if needed.
4. Volume scale defaults to 6 dp — pass `{ scale }` for display rounding.

## Do not

- Import `@eristack/uom` from this package core
- Use `Number()` on length/width/height at the API boundary
