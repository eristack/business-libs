/**
 * Editorial brand tokens — canonical values for TS/JS.
 * Keep in sync with `src/app/globals.css`.
 */

export const brand = {
  ink: {
    light: "#131316",
    dark: "#f3f2ef",
  },
  accent: {
    light: "#0d5568",
    dark: "#5ebad4",
  },
  surface: {
    light: {
      page: "#f5f4f1",
      rail: "#ebeae5",
      card: "#ffffff",
      elevated: "#fafaf8",
    },
    dark: {
      page: "#0e0e0d",
      rail: "#121211",
      card: "#181817",
      elevated: "#1e1e1c",
    },
  },
  prose: {
    light: {
      body: "#3b3a36",
      muted: "#6e6c65",
    },
    dark: {
      body: "#d2d0c9",
      muted: "#989690",
    },
  },
} as const;

/** Layer accents — navigation chrome only. */
export const layerAccents = {
  primitive: { light: "#0d6b62", dark: "#3dd9c6" },
  capability: { light: "#92600a", dark: "#facc15" },
  service: { light: "#0d5568", dark: "#5ebad4" },
  ai: { light: "#0e7490", dark: "#22d3ee" },
  infrastructure: { light: "#534687", dark: "#a78bfa" },
  ui: { light: "#b01842", dark: "#fb7185" },
  features: { light: "#047857", dark: "#34d399" },
} as const;

export type LayerAccentId = keyof typeof layerAccents;

/** Type scale (rem) — mirrors CSS custom properties. */
export const typeScale = {
  display: "clamp(2.25rem, 4vw, 3.25rem)",
  h1: "1.875rem",
  h2: "1.375rem",
  h3: "1.125rem",
  body: "0.9375rem",
  small: "0.8125rem",
  caption: "0.6875rem",
} as const;

export const fonts = {
  sans: "Plus Jakarta Sans",
  display: "Newsreader",
  mono: "JetBrains Mono",
} as const;
