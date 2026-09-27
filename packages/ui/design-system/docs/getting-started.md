---
title: Getting started
description: Erista tokens, Tailwind preset, and DensityProvider for ERP UI
---

# Getting started

Canonical stack map: `@eristack/ai-knowledge#ui-package-stack`.

## Install

```bash
pnpm add @eristack/design-system tailwindcss react
```

Peers: `react` and `tailwindcss` (optional if you only inject CSS vars without Tailwind).

## Tokens in the app

**Option A — CSS file (recommended)**

Copy or import the shipped file:

```css
/* app/globals.css */
@import "@eristack/design-system/src/tokens.css";
```

**Option B — inject in layout**

```tsx
import { ERISTACK_CSS_VARS } from "@eristack/design-system";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: ERISTACK_CSS_VARS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Tailwind

```ts
// tailwind.config.ts
import { tailwindPreset } from "@eristack/design-system";

export default {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

Use semantic classes backed by Erista variables (for example surfaces and borders used by list-shell and doc-shell).

## Density

Wrap ERP routes so tables and forms share spacing:

```tsx
import { DensityProvider, useDensity } from "@eristack/design-system/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <DensityProvider density="comfortable">{children}</DensityProvider>;
}

function Toolbar() {
  const { density, setDensity } = useDensity();
  return (
    <select value={density} onChange={(e) => setDensity(e.target.value as "compact" | "comfortable" | "spacious")}>
      <option value="compact">Compact</option>
      <option value="comfortable">Comfortable</option>
      <option value="spacious">Spacious</option>
    </select>
  );
}
```

Default density is **`comfortable`**.

## Production path

1. Tokens + preset here.
2. `@eristack/form-ui` for domain inputs on TanStack Form.
3. `@eristack/list-shell` or `@eristack/doc-shell` for page chrome.
4. Run **`shadcn add`** in the app for buttons, dialogs, and tables — not from this package.

## Exports

| Import | Use |
| --- | --- |
| `@eristack/design-system` | `ERISTACK_CSS_VARS`, `tailwindPreset` |
| `@eristack/design-system/react` | `DensityProvider`, `useDensity` |

After `pnpm build`, `pnpm exports:check` validates published subpaths.
