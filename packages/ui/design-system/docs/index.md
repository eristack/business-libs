---
title: Overview
description: Erista design tokens as CSS variables (HSL colour triplets, radius, density gaps), a Tailwind preset mapping them to semantic classes, and a React DensityProvider — the base every @eristack/ui-* package styles against.
---

# @eristack/design-system

ERP screens built from `@eristack/list-shell`, `@eristack/doc-shell`, `@eristack/form-ui`, and your own shadcn components need one source of colour, radius, and spacing. `@eristack/design-system` is that source, kept deliberately small:

- **Tokens** — twelve `--erista-*` CSS variables (`tokens.css`, or `ERISTACK_CSS_VARS` for JS injection, or `eristaCssVarMap` for programmatic theming).
- **Tailwind preset** — `background`, `foreground`, `primary`, `muted`, `border`, `destructive` colours + `rounded` + `density-*` spacing, all backed by the variables so runtime theming works.
- **Density** — `DensityProvider` / `useDensity` / `densityClassNames` so tables and forms agree on `compact | comfortable | spacious`.

No component library ships here. Run `shadcn add` in the app; its `background`/`primary`/`muted` semantics line up with the preset.

## Use it when

- Starting any app that uses `@eristack/ui-*` packages (they assume the tokens exist).
- You want white-label theming by overriding CSS variables per tenant.
- ERP users need a density switch.

## Not for

- Buttons, dialogs, tables — shadcn in the app.
- Typography scale, shadows, motion — not tokenised in v0; define in app CSS.
- Tailwind v4 `@theme` — the preset targets Tailwind v3 config; v4 users can map `eristaCssVarMap` into `@theme` manually.

## Install

```bash
pnpm add @eristack/design-system react tailwindcss
```

Peers: `react`, `tailwindcss` (only if you use the preset).

## 30-second example

```css
/* globals.css */
@import "@eristack/design-system/tokens.css";
```

```ts
// tailwind.config.ts
import { tailwindPreset } from "@eristack/design-system";
export default { presets: [tailwindPreset], content: ["./src/**/*.{ts,tsx}"] };
```

```tsx
import { DensityProvider } from "@eristack/design-system/react";
<DensityProvider density="comfortable"><App /></DensityProvider>
```

## API

| Import | Export | Notes |
| --- | --- | --- |
| `@eristack/design-system/tokens.css` | stylesheet | `:root { --erista-color-*: H S% L%; --erista-radius; --erista-density-gap-{compact,comfortable,spacious} }` |
| `@eristack/design-system` | `ERISTACK_CSS_VARS: string` | Same block as a string for `<style>` injection (SSR layouts). |
| | `eristaCssVarMap` | `Record<"--erista-…", string>` of defaults — iterate to build tenant themes or Tailwind v4 `@theme`. |
| | `tailwindPreset` | Tailwind v3 preset: `colors.{background,foreground,primary(+foreground),muted(+foreground),border,destructive}`, `borderRadius.DEFAULT`, `spacing.density-{compact,comfortable,spacious}`. |
| `@eristack/design-system/react` | `DensityProvider({ density = "comfortable", children })` | Context provider. |
| | `useDensity(): Density` | Returns the **string** (`"compact" \| "comfortable" \| "spacious"`); no setter — hold the state in the app. |
| | `densityClassNames(density): string` | → `erista-density-compact` etc. for a root class. |
| | `Density`, `DensityProviderProps` | types |

Colour variables are **HSL triplets without `hsl()`** — write `hsl(var(--erista-color-border))` (or `hsl(var(--erista-color-foreground) / 0.4)` for alpha). The Tailwind preset already wraps them.

## Tokens (defaults)

| Variable | Default | Tailwind |
| --- | --- | --- |
| `--erista-color-background` | `0 0% 100%` | `bg-background` |
| `--erista-color-foreground` | `222 47% 11%` | `text-foreground` |
| `--erista-color-primary` / `-foreground` | `222 47% 11%` / `210 40% 98%` | `bg-primary text-primary-foreground` |
| `--erista-color-muted` / `-foreground` | `210 40% 96%` / `215 16% 47%` | `bg-muted text-muted-foreground` |
| `--erista-color-border` | `214 32% 91%` | `border-border` |
| `--erista-color-destructive` | `0 84% 60%` | `bg-destructive` |
| `--erista-radius` | `0.375rem` | `rounded` |
| `--erista-density-gap-compact/comfortable/spacious` | `0.25rem / 0.5rem / 0.75rem` | `gap-density-compact` … |

## Works with

- All `@eristack/ui-*` packages — their `erista-*` class hooks are meant to be styled with these variables.
- shadcn/ui — same semantic colour names.
- `@eristack/multitab` — tab chrome in app CSS using the tokens.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/design-system#design-system-core`
- Recipe: `erp-ui-design-system`. Stack: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — CSS vs injected tokens, Tailwind wiring, density switch with state, dark/tenant theming, and Tailwind v4 notes.
