# @eristack/iso-3166

ISO 3166-1 assigned country codes (alpha-2 and alpha-3) and ISO 3166-2 subdivision format normalization.

```ts
import { normalizeAlpha2, alpha3ToAlpha2 } from "@eristack/iso-3166";

normalizeAlpha2("id"); // "ID"
alpha3ToAlpha2("IDN"); // "ID"
```

Docs: [packages/registries/iso-3166/docs/index.md](./docs/index.md)
