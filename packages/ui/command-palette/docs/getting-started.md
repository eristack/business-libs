---
title: Getting started
description: Cmd+K command palette state and dialog shell
---

# Getting started

Style with Erista tokens from `@eristack/design-system` — class names use the `erista-command-palette*` prefix.

## Install

```bash
pnpm add @eristack/command-palette react
```

## Hook + dialog

```tsx
import { useCommandPalette, CommandPaletteDialog } from "@eristack/command-palette";
import { useEffect } from "react";

function AppCommandPalette() {
  const { open, openPalette, closePalette, togglePalette } = useCommandPalette();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePalette]);

  return (
    <CommandPaletteDialog open={open} onClose={closePalette} title="Go to…">
      <nav>
        <button type="button" onClick={() => navigate("/partners")}>
          Partners
        </button>
      </nav>
    </CommandPaletteDialog>
  );
}
```

## Production path

1. Register commands from TanStack Router route tree or a static manifest.
2. Import `@eristack/design-system/src/tokens.css` so palette surfaces match list/doc screens.
3. Optional: nest inside `@eristack/multitab` app shell in `examples/react`.

## Exports

`useCommandPalette`, `CommandPaletteDialog`.
