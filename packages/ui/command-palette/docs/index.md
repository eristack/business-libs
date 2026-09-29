---
title: Overview
description: Headless Cmd/Ctrl+K state hook plus a minimal accessible dialog shell for ERP command palettes — you supply commands, search, and styling; the package supplies open/close state and `erista-command-palette*` markup.
---

# @eristack/command-palette

A command palette is 90 % app content (routes, actions, recent documents) and 10 % plumbing: open/close state, a keyboard shortcut, a modal with a backdrop. `@eristack/command-palette` ships the 10 %: `useCommandPalette()` for state and `CommandPaletteDialog` for an `aria-modal` shell with stable class hooks. No fuzzy search, no command registry, no styles — those vary per app and belong there (or in `cmdk` if you want a full solution).

## Use it when

- Adding Cmd/Ctrl+K navigation to an Eristack ERP app and you want the same open/close contract everywhere.
- You render your own command list (TanStack Router routes, recent docs) and only need the modal + state.

## Not for

- Fuzzy matching, grouping, keyboard list navigation — bring `cmdk` or your own list inside `children`.
- Non-modal search boxes — use a plain input.
- Dialog focus management beyond basics — v0 has no focus trap; wrap in your dialog primitive if required.

## Install

```bash
pnpm add @eristack/command-palette react
```

Peer: `react`. Optional `@eristack/design-system` tokens for styling.

## 30-second example

```tsx
import { useCommandPalette, CommandPaletteDialog } from "@eristack/command-palette";

const palette = useCommandPalette();

useHotkey("mod+k", palette.togglePalette);

<CommandPaletteDialog open={palette.open} onClose={palette.closePalette} title="Go to…">
  <CommandList onPick={(cmd) => { cmd.run(); palette.closePalette(); }} />
</CommandPaletteDialog>
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `useCommandPalette` | `(initialOpen = false) => { open, setOpen, openPalette, closePalette, togglePalette }` | Callbacks are stable (`useCallback`). |
| `CommandPaletteDialog` | `({ open, onClose?, title? = "Commands", children? }) => JSX \| null` | `null` when closed. Renders `.erista-command-palette[role=dialog][aria-modal=true][aria-label=title]` → `__backdrop` (click → `onClose`) + `__panel` → `<header>{title}</header>` + `__body{children}`. |
| `CommandPaletteDialogProps` | type | |

## Works with

- TanStack Router — build commands from the route tree; `navigate()` then `closePalette()`.
- `@eristack/multitab` — "open in new tab" commands.
- `@eristack/design-system` — `hsl(var(--erista-color-background))`, `--erista-radius` for the panel.
- `@eristack/rbac` / `@eristack/policy-ui` — filter commands by `useCan` before rendering.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/command-palette#command-palette-core`
- Recipe: `erp-ui-shell`. Composition: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — global shortcut hook, command manifest from routes, search input + arrow-key list, Escape handling, CSS.
