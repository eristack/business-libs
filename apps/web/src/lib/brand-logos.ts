import type { SimpleIcon } from "simple-icons";
import {
  siDrizzle,
  siExpress,
  siGithub,
  siNestjs,
  siNextdotjs,
  siNpm,
  siOpenapiinitiative,
  siPnpm,
  siPostgresql,
  siReact,
  siReactquery,
  siTailwindcss,
  siTanstack,
  siTurborepo,
  siTypescript,
  siVitest,
  siZod,
} from "simple-icons";
import type { ResolvedTheme } from "@/lib/theme";

/** Keys used in ecosystem content + platform links */
export type BrandLogoKey =
  | "github"
  | "npm"
  | "typescript"
  | "pnpm"
  | "turborepo"
  | "vitest"
  | "changesets"
  | "drizzle"
  | "postgresql"
  | "zod"
  | "express"
  | "nestjs"
  | "openapi"
  | "react"
  | "tanstack-query"
  | "tanstack-router"
  | "tanstack-form"
  | "tanstack-intent"
  | "nextjs"
  | "tailwind";

export const brandLogos: Record<BrandLogoKey, SimpleIcon> = {
  github: siGithub,
  npm: siNpm,
  typescript: siTypescript,
  pnpm: siPnpm,
  turborepo: siTurborepo,
  vitest: siVitest,
  changesets: siGithub,
  drizzle: siDrizzle,
  postgresql: siPostgresql,
  zod: siZod,
  express: siExpress,
  nestjs: siNestjs,
  openapi: siOpenapiinitiative,
  react: siReact,
  "tanstack-query": siReactquery,
  "tanstack-router": siTanstack,
  "tanstack-form": siTanstack,
  "tanstack-intent": siTanstack,
  nextjs: siNextdotjs,
  tailwind: siTailwindcss,
};

/** Keep in sync with globals.css */
export const themeSurfaces: Record<
  ResolvedTheme,
  { canvas: string; surface: string }
> = {
  dark: { canvas: "#171b26", surface: "#171b26" },
  light: { canvas: "#f3f5f8", surface: "#f3f5f8" },
};

const MIN_LOGO_CONTRAST = 3;

/** Light glyphs on dark UI for black Simple Icon marks */
const DARK_UI_GLYPH: Partial<Record<BrandLogoKey, string>> = {
  github: "#f0f6fc",
  changesets: "#f0f6fc",
  express: "#ffffff",
  nextjs: "#ffffff",
};

/** Marks that wash out on soft light surfaces */
const LIGHT_UI_GLYPH: Partial<Record<BrandLogoKey, string>> = {
  github: "#24292f",
  changesets: "#24292f",
  express: "#1a1a1a",
  nextjs: "#1a1a1a",
  "tanstack-router": "#8b7355",
  "tanstack-form": "#8b7355",
  "tanstack-intent": "#8b7355",
  vitest: "#6e9f48",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function mixWithWhite(hex: string, whiteWeight: number): string {
  const [r, g, b] = hexToRgb(hex);
  const w = Math.min(1, Math.max(0, whiteWeight));
  const mix = (c: number) => Math.round(c * (1 - w) + 255 * w);
  return `#${((mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).padStart(6, "0")}`;
}

export function brandFill(
  key: BrandLogoKey,
  variant: "brand" | "mono",
  resolved: ResolvedTheme,
): string {
  if (variant === "mono") return "currentColor";

  const surface = themeSurfaces[resolved].surface;

  if (resolved === "dark") {
    const override = DARK_UI_GLYPH[key];
    if (override) return override;
  } else {
    const lightOverride = LIGHT_UI_GLYPH[key];
    if (lightOverride) return lightOverride;
  }

  const brand = `#${brandLogos[key].hex}`;
  if (contrastRatio(brand, surface) >= MIN_LOGO_CONTRAST) {
    return brand;
  }

  if (resolved === "dark") {
    let w = 0.2;
    for (let i = 0; i < 6; i++) {
      const candidate = mixWithWhite(brandLogos[key].hex, w);
      if (contrastRatio(candidate, surface) >= MIN_LOGO_CONTRAST) {
        return candidate;
      }
      w += 0.12;
    }
    return "#f1f5f9";
  }

  return brand;
}

export function brandTileBackground(
  key: BrandLogoKey,
  resolved: ResolvedTheme,
): string {
  const brand = `#${brandLogos[key].hex}`;
  const base = themeSurfaces[resolved].surface;
  const darkBrand = relativeLuminance(brand) < 0.12;
  const mixPct =
    resolved === "dark" ? (darkBrand ? 28 : 18) : darkBrand ? 14 : 18;
  return `color-mix(in srgb, ${brand} ${mixPct}%, ${base})`;
}

export function brandGlowHex(
  key: BrandLogoKey,
  resolved: ResolvedTheme,
): string {
  return brandFill(key, "brand", resolved);
}

export function brandHex(key: BrandLogoKey): string {
  return `#${brandLogos[key].hex}`;
}

/** @deprecated use brandFill */
export function brandFillOnDark(
  key: BrandLogoKey,
  variant: "brand" | "mono",
): string {
  return brandFill(key, variant, "dark");
}
