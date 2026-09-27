# Getting started

```bash
pnpm add @eristack/command-palette react
```

```tsx
import { useCommandPalette, CommandPaletteDialog } from "@eristack/command-palette";

const { open, togglePalette, closePalette } = useCommandPalette();

<CommandPaletteDialog open={open} onClose={closePalette}>
  {commands}
</CommandPaletteDialog>
```

Style `.erista-command-palette*` with `@eristack/design-system` tokens in the app.
