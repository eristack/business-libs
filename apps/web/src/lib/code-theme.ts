/** Shared Bright / Shiki themes for product panels and docs. */
export const codeTheme = {
  dark: "one-dark-pro",
  light: "min-light",
  /** Bright: apply light theme when html is not `.dark`. */
  lightSelector: "html:not(.dark)",
} as const;

export const codeFontFamily =
  "var(--font-brand-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
