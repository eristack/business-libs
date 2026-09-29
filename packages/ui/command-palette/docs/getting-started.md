---
title: Getting started
description: Mount a Cmd/Ctrl+K palette — global shortcut, command manifest from TanStack Router routes, search + arrow-key list inside CommandPaletteDialog, Escape/backdrop close, and token-based CSS.
---

# Getting started

Style with Erista tokens from `@eristack/design-system` — class names use the `erista-command-palette*` prefix.

## Install

```bash
pnpm add @eristack/command-palette react
```

## 1. Mount once at the app root

```tsx
import { useCommandPalette, CommandPaletteDialog } from "@eristack/command-palette";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type Command = { id: string; label: string; keywords?: string[]; run: () => void };

export function AppCommandPalette({ commands }: { commands: Command[] }) {
  const { open, closePalette, togglePalette } = useCommandPalette();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); togglePalette(); }
      if (e.key === "Escape" && open) closePalette();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, togglePalette, closePalette]);

  useEffect(() => { if (!open) { setQ(""); setCursor(0); } }, [open]);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? commands.filter((c) => [c.label, ...(c.keywords ?? [])].some((s) => s.toLowerCase().includes(needle)))
      : commands;
  }, [commands, q]);

  const pick = (c: Command) => { c.run(); closePalette(); };

  return (
    <CommandPaletteDialog open={open} onClose={closePalette} title="Go to…">
      <input
        autoFocus
        className="erista-command-palette__input"
        placeholder="Type a command or page…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setCursor(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setCursor((i) => Math.min(i + 1, matches.length - 1));
          if (e.key === "ArrowUp") setCursor((i) => Math.max(i - 1, 0));
          if (e.key === "Enter" && matches[cursor]) pick(matches[cursor]);
        }}
      />
      <ul role="listbox" className="erista-command-palette__list">
        {matches.map((c, i) => (
          <li key={c.id} role="option" aria-selected={i === cursor} onMouseEnter={() => setCursor(i)} onClick={() => pick(c)}>
            {c.label}
          </li>
        ))}
        {matches.length === 0 ? <li className="erista-command-palette__empty">No matches</li> : null}
      </ul>
    </CommandPaletteDialog>
  );
}
```

## 2. Commands from routes (+ permissions)

```tsx
const navigate = useNavigate();
const can = useCan({ rbac, subject: session.userId, permission: "invoices:read" });

const commands: Command[] = [
  { id: "partners", label: "Partners", keywords: ["customer", "vendor"], run: () => navigate({ to: "/partners" }) },
  ...(can.allowed ? [{ id: "invoices", label: "Invoices", run: () => navigate({ to: "/invoices" }) }] : []),
  { id: "new-invoice", label: "New invoice", run: () => navigate({ to: "/invoices/new" }) },
];

<AppCommandPalette commands={commands} />
```

Recent documents: push `{ id, label }` into a small Zustand/localStorage list on each document open and prepend them.

## 3. CSS (you own it)

```css
.erista-command-palette { position: fixed; inset: 0; z-index: 50; display: grid; place-items: start center; padding-top: 12vh; }
.erista-command-palette__backdrop { position: absolute; inset: 0; background: hsl(var(--erista-color-foreground) / 0.4); }
.erista-command-palette__panel { position: relative; width: min(640px, 90vw); background: hsl(var(--erista-color-background)); border-radius: var(--erista-radius); border: 1px solid hsl(var(--erista-color-border)); }
.erista-command-palette__panel > header { padding: var(--erista-density-gap-comfortable); color: hsl(var(--erista-color-muted-foreground)); font-size: 0.875rem; }
.erista-command-palette__list [aria-selected="true"] { background: hsl(var(--erista-color-muted)); }
```

## Production path

1. Register commands from TanStack Router route tree or a static manifest; filter by `useCan`.
2. Import `@eristack/design-system/tokens.css` so palette surfaces match list/doc screens.
3. Optional: nest inside `@eristack/multitab` app shell; add "Open in new tab" commands.
4. Need fuzzy matching, groups, virtualised lists? Render `cmdk`'s `Command` inside `CommandPaletteDialog` — the shell still owns open state.

## Gotchas

- The dialog has **no focus trap and no Escape handler**; the example adds Escape globally. Backdrop click calls `onClose`.
- `CommandPaletteDialog` unmounts children when closed — reset search state on close (done above) or keep it in the parent intentionally.
- `aria-label` is the `title`; keep it meaningful ("Go to…", "Commands").
- `useCommandPalette` is plain `useState`; for cross-component control (open from a toolbar button) lift it into context or Zustand.
- Prevent the browser's Cmd+K default (address bar focus in some browsers) with `e.preventDefault()`.

## Exports

`useCommandPalette`, `CommandPaletteDialog` + `CommandPaletteDialogProps`.
