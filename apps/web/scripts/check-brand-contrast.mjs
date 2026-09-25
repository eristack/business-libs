/**
 * WCAG AA (4.5:1) for primary marketing text colors on page surfaces.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokensPath = path.join(root, "src/lib/brand-tokens.ts");

const MIN_BODY = 4.5;
/** Accent hues are used for large type, chips, and fills — AA large text (3:1). */
const MIN_ACCENT = 3;
const BACKGROUNDS = {
  lightPage: "#f4f5f7",
  lightCard: "#ffffff",
  darkPage: "#11151d",
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

function parseHex(src, key) {
  const re = new RegExp(`${key}:\\s*"(#[0-9a-fA-F]{6})"`);
  const match = src.match(re);
  if (!match) throw new Error(`Missing ${key} in brand-tokens.ts`);
  return match[1];
}

const src = fs.readFileSync(tokensPath, "utf8");
const primary = parseHex(src, "primary");
const secondary = parseHex(src, "secondary");
const tertiary = parseHex(src, "tertiary");
const onSurface = parseHex(src, "onSurface");
const onPrimary = parseHex(src, "onPrimary");
const onDark = parseHex(src, "onDark");

const bodyChecks = [
  ["onSurface on light page", onSurface, BACKGROUNDS.lightPage, MIN_BODY],
  ["onSurface on white card", onSurface, BACKGROUNDS.lightCard, MIN_BODY],
  ["onDark on neutral footer", onDark, BACKGROUNDS.darkPage, MIN_BODY],
];

const accentChecks = [
  ["secondary on white (links)", secondary, BACKGROUNDS.lightCard, MIN_ACCENT],
  ["primary on dark band", primary, BACKGROUNDS.darkPage, MIN_ACCENT],
  ["onPrimary on primary button", onPrimary, primary, MIN_BODY],
];

let failed = false;
for (const [label, fg, bg, min] of [...bodyChecks, ...accentChecks]) {
  const ratio = contrast(fg, bg);
  if (ratio < min) {
    console.error(`✗ ${label}: ${ratio.toFixed(2)}:1 (need ${min})`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✓ brand contrast — WCAG AA on marketing surfaces");
