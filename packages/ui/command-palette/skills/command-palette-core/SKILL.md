---
name: command-palette-core
description: >
  @eristack/command-palette useCommandPalette(initialOpen?) → { open, setOpen, openPalette,
  closePalette, togglePalette } + CommandPaletteDialog { open, onClose, title, children } (aria-modal
  shell, backdrop click closes, null when closed, erista-command-palette* hooks). Use for Cmd/Ctrl+K
  navigation in ERP apps; app supplies commands (Router routes, rbac-filtered), search, arrow keys,
  Escape, and CSS. No fuzzy search, registry, or focus trap.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/command-palette"
sources:
  - packages/ui/command-palette/docs/getting-started.md
---

# @eristack/command-palette

State + shell; commands are yours.

```tsx
const { open, closePalette, togglePalette } = useCommandPalette();
useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); togglePalette(); } if (e.key === "Escape") closePalette(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

<CommandPaletteDialog open={open} onClose={closePalette} title="Go to…">
  <input autoFocus value={q} onChange={…} onKeyDown={arrowsAndEnter} />
  <ul role="listbox">{matches.map((c, i) => <li role="option" aria-selected={i === cursor} onClick={() => { c.run(); closePalette(); }}>{c.label}</li>)}</ul>
</CommandPaletteDialog>
```

## Checklist

1. Mount once at app root; commands `{ id, label, keywords?, run }` built from Router routes + recent docs, filtered by `useCan`.
2. Global keydown: mod+K toggle (preventDefault), Escape close.
3. Reset search/cursor when `open` becomes false (children unmount).
4. Style `.erista-command-palette`, `__backdrop`, `__panel`, `__body` with design-system tokens.
5. Need fuzzy/groups/virtualisation → render `cmdk` inside the dialog; keep `useCommandPalette` as the open-state owner.

## Do not

- Expect search, a registry, or a focus trap from this package.
- Register a second shortcut listener per screen — one at root.
- Put policy checks inside the palette; filter the command list before rendering.
