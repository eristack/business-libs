/**
 * WCAG AA contrast for light + dark marketing surfaces.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokensPath = path.join(root, "src/lib/brand-tokens.ts");

const MIN_BODY = 4.5;
const MIN_ACCENT = 3;

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

function parseHex(src, key) {
  const re = new RegExp(`${key}:\\s*"(#[0-9a-fA-F]{6})"`);
  const match = src.match(re);
  if (!match) throw new Error(`Missing ${key} in brand-tokens.ts`);
  return match[1];
}

const src = fs.readFileSync(tokensPath, "utf8");
const primary = parseHex(src, "primary");
const primaryOnLight = parseHex(src, "primaryOnLight");
const secondary = parseHex(src, "secondary");
const tertiary = parseHex(src, "tertiary");
const onPrimary = parseHex(src, "onPrimary");
const onPrimaryLight = parseHex(src, "onPrimaryLight");
const primaryActionLight = parseHex(src, "primaryActionLight");
const onDark = parseHex(src, "onDark");

const darkCanvas = parseHex(src, "neutral");
const darkSurface = parseHex(src, "surface");
const darkForeground = parseHex(src, "foreground");
const darkMuted = parseHex(src, "muted");

const lightBlock = src.match(/light:\s*\{([^}]+)\}/s);
if (!lightBlock) throw new Error("Missing light { } in brand-tokens.ts");
const lightInner = lightBlock[1];
const lightCanvas = lightInner.match(/canvas:\s*"(#[0-9a-fA-F]{6})"/)?.[1];
const lightForeground = lightInner.match(/foreground:\s*"(#[0-9a-fA-F]{6})"/)?.[1];
if (!lightCanvas || !lightForeground) {
  throw new Error("Missing light.canvas or light.foreground in brand-tokens.ts");
}

const checks = [
  ["dark foreground on canvas", darkForeground, darkCanvas, MIN_BODY],
  ["dark foreground on surface", darkForeground, darkSurface, MIN_BODY],
  ["dark muted on canvas", darkMuted, darkCanvas, MIN_BODY],
  ["light foreground on canvas", lightForeground, lightCanvas, MIN_BODY],
  ["onPrimary on primary", onPrimary, primary, MIN_BODY],
  ["onDark on dark canvas", onDark, darkCanvas, MIN_BODY],
  ["primary on dark canvas (accent)", primary, darkCanvas, MIN_ACCENT],
  ["secondary on dark canvas (accent)", secondary, darkCanvas, MIN_ACCENT],
  ["primaryOnLight on light canvas (accent)", primaryOnLight, lightCanvas, MIN_ACCENT],
  [
    "onPrimaryLight on primaryActionLight (light buttons)",
    onPrimaryLight,
    primaryActionLight,
    MIN_BODY,
  ],
];

let failed = false;
for (const [label, fg, bg, min] of checks) {
  const ratio = contrast(fg, bg);
  if (ratio < min) {
    console.error(`✗ ${label}: ${ratio.toFixed(2)}:1 (need ${min})`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✓ brand contrast — light + dark marketing surfaces");
