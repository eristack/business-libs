/** Raw `:root` CSS variable block — mirrors `tokens.css` for JS injection. */
export const ERISTACK_CSS_VARS = `:root {
  --erista-color-background: 0 0% 100%;
  --erista-color-foreground: 222 47% 11%;
  --erista-color-primary: 222 47% 11%;
  --erista-color-primary-foreground: 210 40% 98%;
  --erista-color-muted: 210 40% 96%;
  --erista-color-muted-foreground: 215 16% 47%;
  --erista-color-border: 214 32% 91%;
  --erista-color-destructive: 0 84% 60%;
  --erista-radius: 0.375rem;
  --erista-density-gap-compact: 0.25rem;
  --erista-density-gap-comfortable: 0.5rem;
  --erista-density-gap-spacious: 0.75rem;
}
`;

/** CSS custom property names → default HSL components (without `hsl()` wrapper). */
export const eristaCssVarMap = {
  "--erista-color-background": "0 0% 100%",
  "--erista-color-foreground": "222 47% 11%",
  "--erista-color-primary": "222 47% 11%",
  "--erista-color-primary-foreground": "210 40% 98%",
  "--erista-color-muted": "210 40% 96%",
  "--erista-color-muted-foreground": "215 16% 47%",
  "--erista-color-border": "214 32% 91%",
  "--erista-color-destructive": "0 84% 60%",
  "--erista-radius": "0.375rem",
  "--erista-density-gap-compact": "0.25rem",
  "--erista-density-gap-comfortable": "0.5rem",
  "--erista-density-gap-spacious": "0.75rem",
} as const;

/** Tailwind v3 preset — extend in `tailwind.config` `presets: [eristaTailwindPreset]`. */
export const tailwindPreset = {
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "var(--erista-radius)",
      },
      colors: {
        background: "hsl(var(--erista-color-background))",
        foreground: "hsl(var(--erista-color-foreground))",
        primary: {
          DEFAULT: "hsl(var(--erista-color-primary))",
          foreground: "hsl(var(--erista-color-primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--erista-color-muted))",
          foreground: "hsl(var(--erista-color-muted-foreground))",
        },
        border: "hsl(var(--erista-color-border))",
        destructive: {
          DEFAULT: "hsl(var(--erista-color-destructive))",
        },
      },
      spacing: {
        "density-compact": "var(--erista-density-gap-compact)",
        "density-comfortable": "var(--erista-density-gap-comfortable)",
        "density-spacious": "var(--erista-density-gap-spacious)",
      },
    },
  },
} as const;
