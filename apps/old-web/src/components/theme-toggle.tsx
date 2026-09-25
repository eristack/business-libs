"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`${LABELS[theme]}. Click to cycle theme.`}
      title={LABELS[theme]}
      onClick={cycleTheme}
    >
      {theme === "light" ? (
        <Sun />
      ) : theme === "dark" ? (
        <Moon />
      ) : (
        <Monitor />
      )}
    </Button>
  );
}
