/** Single source for marketing brand colors — kept in sync with globals.css + contrast CI. */
export const brandColors = {
  /** Buttons / accents on dark UI */
  primary: "#10b981",
  /** Links and accents on soft light canvas (WCAG 3:1+) */
  primaryOnLight: "#0a7c59",
  secondary: "#6366f1",
  tertiary: "#f59e0b",
  neutral: "#11151d",
  surface: "#171b26",
  surfaceRaised: "#1e2433",
  border: "#2d3548",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  onPrimary: "#11151d",
  onPrimaryLight: "#ffffff",
  primaryActionLight: "#047857",
  onDark: "#ffffff",
  light: {
    canvas: "#e9edf3",
    surface: "#f3f5f8",
    foreground: "#1e293b",
    muted: "#64748b",
  },
} as const;
