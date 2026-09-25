/** Single source for marketing brand colors — kept in sync with globals.css + contrast CI. */
export const brandColors = {
  primary: "#10b981",
  secondary: "#6366f1",
  tertiary: "#f59e0b",
  neutral: "#11151d",
  surface: "#ffffff",
  surfaceMuted: "#f4f5f7",
  /** Dark text on emerald fill — passes AA on #10b981 */
  onPrimary: "#11151d",
  onNeutral: "#ffffff",
  onDark: "#ffffff",
  onSurface: "#11151d",
} as const;
