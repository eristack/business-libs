"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useMounted, useTheme } from "@/components/theme-provider";
import type { Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, cycleTheme } = useTheme();
  const label = mounted ? LABELS[theme] : LABELS.system;

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
      aria-label={`${label}. Click to cycle.`}
      title={label}
      onClick={cycleTheme}
      suppressHydrationWarning
    >
      {!mounted || theme === "system" ? (
        <Monitor className="size-[18px]" aria-hidden />
      ) : theme === "light" ? (
        <Sun className="size-[18px]" aria-hidden />
      ) : (
        <Moon className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
