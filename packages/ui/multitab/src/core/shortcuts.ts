export type MultitabShortcutAction =
  | "closeActiveTab"
  | "closeAllTabs"
  | "nextTab"
  | "previousTab"
  | "openNewTab";

export type MultitabShortcutBinding = {
  action: MultitabShortcutAction;
  /** e.g. `Mod+W`, `Mod+Shift+T` — app maps to platform keys. */
  keys: string;
  description: string;
};

/** Headless default shortcut map — wire in app keyboard layer. */
export const DEFAULT_MULTITAB_SHORTCUTS: readonly MultitabShortcutBinding[] = [
  { action: "closeActiveTab", keys: "Mod+W", description: "Close active tab" },
  { action: "closeAllTabs", keys: "Mod+Shift+W", description: "Close all tabs" },
  { action: "nextTab", keys: "Mod+Alt+Right", description: "Next tab" },
  { action: "previousTab", keys: "Mod+Alt+Left", description: "Previous tab" },
  { action: "openNewTab", keys: "Mod+T", description: "Open new tab" },
] as const;
