export const THEME_STORAGE_KEY = "eristack-theme";

export type Theme = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  document.documentElement.dataset.theme = resolved;
}

export function cycleTheme(current: Theme): Theme {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}
