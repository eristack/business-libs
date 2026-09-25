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

/** Marketing site canvas — keep in sync with globals.css */
const DARK_SURFACE = "#171b26";
const MIN_LOGO_CONTRAST = 3;

/** Marks that are black/dark in Simple Icons — use light glyphs on dark UI */
const DARK_UI_GLYPH: Partial<Record<BrandLogoKey, string>> = {
  github: "#f0f6fc",
  changesets: "#f0f6fc",
  express: "#ffffff",
  nextjs: "#ffffff",
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
  const nr = mix(r);
  const ng = mix(g);
  const nb = mix(b);
  return `#${((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, "0")}`;
}

/** SVG fill for dark-first marketing surfaces */
export function brandFillOnDark(
  key: BrandLogoKey,
  variant: "brand" | "mono",
): string {
  if (variant === "mono") return "currentColor";

  const override = DARK_UI_GLYPH[key];
  if (override) return override;

  const brand = `#${brandLogos[key].hex}`;
  if (contrastRatio(brand, DARK_SURFACE) >= MIN_LOGO_CONTRAST) {
    return brand;
  }

  let w = 0.2;
  for (let i = 0; i < 6; i++) {
    const candidate = mixWithWhite(brandLogos[key].hex, w);
    if (contrastRatio(candidate, DARK_SURFACE) >= MIN_LOGO_CONTRAST) {
      return candidate;
    }
    w += 0.12;
  }
  return "#f1f5f9";
}

/** Tile well background — stronger tint when the brand hex is very dark */
export function brandTileBackground(key: BrandLogoKey): string {
  const brand = `#${brandLogos[key].hex}`;
  const darkBrand = relativeLuminance(brand) < 0.12;
  const mixPct = darkBrand ? 28 : 18;
  return `color-mix(in srgb, ${brand} ${mixPct}%, ${DARK_SURFACE})`;
}

export function brandGlowHex(key: BrandLogoKey): string {
  const override = DARK_UI_GLYPH[key];
  if (override) return override;
  const brand = `#${brandLogos[key].hex}`;
  if (contrastRatio(brand, DARK_SURFACE) >= MIN_LOGO_CONTRAST) return brand;
  return mixWithWhite(brandLogos[key].hex, 0.35);
}

export function brandHex(key: BrandLogoKey): string {
  return `#${brandLogos[key].hex}`;
}
