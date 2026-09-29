---
name: design-system-core
description: >
  @eristack/design-system Erista tokens (12 --erista-* CSS vars: HSL colour triplets, radius,
  density gaps) via tokens.css subpath or ERISTACK_CSS_VARS/eristaCssVarMap, Tailwind v3
  tailwindPreset (background/foreground/primary/muted/border/destructive, rounded, density spacing),
  and React DensityProvider/useDensity()/densityClassNames. Load first for any @eristack/ui-* app;
  shadcn components stay in the app. No typography/shadow tokens; useDensity has no setter.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/design-system"
sources:
  - packages/ui/design-system/docs/getting-started.md
---

# @eristack/design-system

Tokens + preset + density. Nothing else.

```css
@import "@eristack/design-system/tokens.css";          /* or <style>{ERISTACK_CSS_VARS}</style> in SSR head */
[data-theme="dark"] { --erista-color-background: 222 47% 11%; }   /* theme = override vars */
```

```ts
export default { presets: [tailwindPreset], content: ["./src/**/*.{ts,tsx}"] };   // bg-background border-border rounded gap-density-comfortable
```

```tsx
const [density, setDensity] = useState<Density>("comfortable");    // app owns state
<DensityProvider density={density}><div className={densityClassNames(density)}>{children}</div></DensityProvider>
const d = useDensity();                                             // read-only string
```

## Checklist

1. Tokens loaded before shadcn CSS; alias shadcn vars to `--erista-*` if you want one palette.
2. Colours are HSL triplets → always `hsl(var(--erista-color-x))` (alpha: `hsl(var(--x) / 0.4)`).
3. Density: state in app (+ localStorage), `DensityProvider` for readers, root class from `densityClassNames` driving a `--erista-gap` var in CSS.
4. Tenant/dark themes = CSS variable overrides under a selector; programmatic via `eristaCssVarMap`.
5. Tailwind v4: map vars into `@theme` manually — the preset is v3.

## Do not

- Import `src/tokens.css` (not exported) — use `@eristack/design-system/tokens.css`.
- Expect components, typography, or shadows from this package.
- Call `useDensity()` for a setter.
