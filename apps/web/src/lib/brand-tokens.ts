/** Single source for marketing brand colors — kept in sync with globals.css + contrast CI. */
export const brandColors = {
  primary: "#10b981",
  secondary: "#6366f1",
  tertiary: "#f59e0b",
  /** Page canvas */
  neutral: "#11151d",
  /** Elevated panels */
  surface: "#171b26",
  surfaceRaised: "#1e2433",
  border: "#2d3548",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  /** Dark text on emerald fill — passes AA on #10b981 */
  onPrimary: "#11151d",
  onDark: "#ffffff",
} as const;
