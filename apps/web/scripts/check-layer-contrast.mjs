/**
 * WCAG AA (4.5:1) for layer accent text on card + page surfaces.
 * Keeps brand-tokens.ts and globals.css layer hex values in sync.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandTokensPath = path.join(root, "src/lib/brand-tokens.ts");
const globalsPath = path.join(root, "src/app/globals.css");

const MIN_RATIO = 4.5;
const BACKGROUNDS = {
  lightCard: "#ffffff",
  lightPage: "#f5f4f1",
  darkCard: "#181817",
  darkPage: "#0e0e0d",
};

function luminance([r, g, b]) {
  const channel = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(hexA, hexB) {
  const parse = (hex) => {
    const n = Number.parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const l1 = luminance(parse(hexA));
  const l2 = luminance(parse(hexB));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseBrandTokens(src) {
  const block = src.match(/export const layerAccents = \{([\s\S]*?)\} as const/);
  if (!block) throw new Error("layerAccents block not found in brand-tokens.ts");

  const layers = {};
  for (const match of block[1].matchAll(
    /(\w+):\s*\{\s*light:\s*"([^"]+)",\s*dark:\s*"([^"]+)"\s*\}/g,
  )) {
    layers[match[1]] = { light: match[2], dark: match[3] };
  }
  return layers;
}

function parseGlobalsLayerAccents(src) {
  const layers = {};
  const withoutDarkBlocks = src.replace(
    /\.dark\s+\[data-layer="[^"]+"\]\s*\{[^}]*\}/g,
    "",
  );

  for (const match of withoutDarkBlocks.matchAll(
    /\[data-layer="(\w+)"\]\s*\{\s*--layer-accent:\s*(#[0-9a-fA-F]+)/g,
  )) {
    layers[match[1]] = { ...layers[match[1]], light: match[2].toLowerCase() };
  }

  for (const match of src.matchAll(
    /\.dark\s+\[data-layer="(\w+)"\]\s*\{\s*--layer-accent:\s*(#[0-9a-fA-F]+)/g,
  )) {
    layers[match[1]] = { ...layers[match[1]], dark: match[2].toLowerCase() };
  }

  return layers;
}

function normalizeHex(hex) {
  return hex.toLowerCase();
}

const brandTokens = parseBrandTokens(fs.readFileSync(brandTokensPath, "utf8"));
const globalsLayers = parseGlobalsLayerAccents(fs.readFileSync(globalsPath, "utf8"));

const errors = [];

for (const layerId of Object.keys(brandTokens)) {
  const token = brandTokens[layerId];
  const css = globalsLayers[layerId];
  if (!css?.light || !css?.dark) {
    errors.push(`globals.css missing layer accent for "${layerId}"`);
    continue;
  }
  if (
    normalizeHex(token.light) !== normalizeHex(css.light) ||
    normalizeHex(token.dark) !== normalizeHex(css.dark)
  ) {
    errors.push(
      `layer "${layerId}" out of sync — brand-tokens light=${token.light} dark=${token.dark}, globals light=${css.light} dark=${css.dark}`,
    );
  }

  for (const [mode, hex] of Object.entries({ light: token.light, dark: token.dark })) {
    const surfaces =
      mode === "light"
        ? { lightCard: BACKGROUNDS.lightCard, lightPage: BACKGROUNDS.lightPage }
        : { darkCard: BACKGROUNDS.darkCard, darkPage: BACKGROUNDS.darkPage };

    for (const [surfaceName, bg] of Object.entries(surfaces)) {
      const ratio = contrast(hex, bg);
      if (ratio < MIN_RATIO) {
        errors.push(
          `${layerId} ${mode} ${hex} on ${surfaceName} (${bg}): ${ratio.toFixed(2)}:1 (need ${MIN_RATIO}:1)`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Layer contrast check failed:\n");
  for (const err of errors) console.error(`  • ${err}`);
  process.exit(1);
}

console.log(
  `Layer contrast OK — ${Object.keys(brandTokens).length} layers, WCAG AA ${MIN_RATIO}:1 on card + page surfaces.`,
);
