---
title: Getting started
description: Load Erista tokens (CSS import or SSR injection), wire the Tailwind preset, add a density switch with DensityProvider/useDensity, theme per tenant or dark mode by overriding variables, and map tokens for Tailwind v4.
---

# Getting started

Canonical stack map: `@eristack/ai-knowledge#ui-package-stack`.

## Install

```bash
pnpm add @eristack/design-system tailwindcss react
```

Peers: `react` and `tailwindcss` (optional if you only inject CSS vars without Tailwind).

## 1. Tokens in the app

**Option A — CSS import (recommended)**

```css
/* app/globals.css */
@import "@eristack/design-system/tokens.css";
```

**Option B — inject in an SSR layout**

```tsx
import { ERISTACK_CSS_VARS } from "@eristack/design-system";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: ERISTACK_CSS_VARS }} /></head>
      <body>{children}</body>
    </html>
  );
}
```

Both define the same `:root` block. Load it **before** shadcn's `globals.css` so its `--background`-style variables can alias Erista's if you want a single palette:

```css
:root { --background: var(--erista-color-background); --border: var(--erista-color-border); }
```

## 2. Tailwind

```ts
// tailwind.config.ts
import { tailwindPreset } from "@eristack/design-system";

export default {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@eristack/*/dist/**/*.js"],
};
```

Now `bg-background text-foreground border-border rounded gap-density-comfortable` resolve to the variables. Include `@eristack/*/dist` in `content` only if you use Tailwind classes inside Eristack UI packages (they mostly ship class *hooks*, not Tailwind classes).

## 3. Density

`useDensity()` returns the current **string**; the app owns the state.

```tsx
import { DensityProvider, useDensity, densityClassNames, type Density } from "@eristack/design-system/react";
import { useState } from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = useState<Density>(() => (localStorage.getItem("density") as Density) ?? "comfortable");
  return (
    <DensityContext.Provider value={{ setDensity }}>            {/* your own setter context */}
      <DensityProvider density={density}>
        <div className={densityClassNames(density)}>{children}</div>
      </DensityProvider>
    </DensityContext.Provider>
  );
}

function DensitySwitch() {
  const density = useDensity();
  const { setDensity } = useContext(DensityContext);
  return (
    <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
      <option value="compact">Compact</option>
      <option value="comfortable">Comfortable</option>
      <option value="spacious">Spacious</option>
    </select>
  );
}
```

```css
/* map the root class to the active gap once; every erista-* component reads --erista-gap */
.erista-density-compact     { --erista-gap: var(--erista-density-gap-compact); }
.erista-density-comfortable { --erista-gap: var(--erista-density-gap-comfortable); }
.erista-density-spacious    { --erista-gap: var(--erista-density-gap-spacious); }
.erista-list-toolbar, .erista-doc-shell { gap: var(--erista-gap); }
```

Default density is **`comfortable`**.

## 4. Theming (tenant / dark)

Override variables under a selector — no JS needed:

```css
[data-theme="dark"] {
  --erista-color-background: 222 47% 11%;
  --erista-color-foreground: 210 40% 98%;
  --erista-color-muted: 217 33% 17%;
  --erista-color-border: 217 33% 24%;
}
[data-tenant="acme"] { --erista-color-primary: 24 95% 53%; }
```

Programmatic themes: start from `eristaCssVarMap`, override keys, emit a `:root {}` block.

```ts
import { eristaCssVarMap } from "@eristack/design-system";
const css = `:root{${Object.entries({ ...eristaCssVarMap, "--erista-color-primary": tenant.primaryHsl }).map(([k, v]) => `${k}:${v}`).join(";")}}`;
```

## 5. Tailwind v4

The preset is a v3 config object. On v4, translate to `@theme`:

```css
@import "@eristack/design-system/tokens.css";
@theme {
  --color-background: hsl(var(--erista-color-background));
  --color-primary: hsl(var(--erista-color-primary));
  --radius: var(--erista-radius);
}
```

## Production path

1. Tokens + preset here.
2. `@eristack/form-ui` for domain inputs on TanStack Form.
3. `@eristack/list-shell` or `@eristack/doc-shell` for page chrome.
4. Run **`shadcn add`** in the app for buttons, dialogs, and tables — not from this package.

## Gotchas

- Colour variables are HSL components; `color: var(--erista-color-border)` is invalid — wrap in `hsl()`.
- `useDensity()` has no setter; it is read-only context.
- `@eristack/design-system/src/tokens.css` (old path) is not in the exports map — use `@eristack/design-system/tokens.css`.
- No typography, shadow, or z-index tokens in v0; define them in the app.

## Testing

```ts
import { eristaCssVarMap, tailwindPreset } from "@eristack/design-system";
expect(tailwindPreset.theme.extend.colors.border).toBe("hsl(var(--erista-color-border))");
expect(Object.keys(eristaCssVarMap)).toHaveLength(12);
```

## Exports

| Import | Use |
| --- | --- |
| `@eristack/design-system` | `ERISTACK_CSS_VARS`, `eristaCssVarMap`, `tailwindPreset` |
| `@eristack/design-system/react` | `DensityProvider`, `useDensity`, `densityClassNames`, `Density` |
| `@eristack/design-system/tokens.css` | the stylesheet |
