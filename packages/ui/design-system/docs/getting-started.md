# Getting started

```bash
pnpm add @eristack/design-system
```

Import tokens in app CSS or inject the string:

```ts
import { ERISTACK_CSS_VARS, tailwindPreset } from "@eristack/design-system";
import { DensityProvider, useDensity } from "@eristack/design-system/react";
```

Inject `ERISTACK_CSS_VARS` in your root layout, or copy `node_modules/@eristack/design-system/src/tokens.css` into the app. Extend Tailwind with `presets: [tailwindPreset]`.

Wrap ERP screens with `DensityProvider` (`compact` | `comfortable` | `spacious`; default `comfortable`).
