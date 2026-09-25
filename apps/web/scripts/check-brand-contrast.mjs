/**
 * WCAG AA contrast for dark-first marketing surfaces.
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
const secondary = parseHex(src, "secondary");
const tertiary = parseHex(src, "tertiary");
const neutral = parseHex(src, "neutral");
const surface = parseHex(src, "surface");
const foreground = parseHex(src, "foreground");
const muted = parseHex(src, "muted");
const onPrimary = parseHex(src, "onPrimary");

const bodyChecks = [
  ["foreground on page", foreground, neutral, MIN_BODY],
  ["foreground on surface card", foreground, surface, MIN_BODY],
  ["muted on page", muted, neutral, MIN_BODY],
  ["onPrimary on primary button", onPrimary, primary, MIN_BODY],
];

const accentChecks = [
  ["primary on page (accent)", primary, neutral, MIN_ACCENT],
  ["secondary on page (links)", secondary, neutral, MIN_ACCENT],
  ["tertiary on page (accent)", tertiary, neutral, MIN_ACCENT],
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
console.log("✓ brand contrast — WCAG AA on dark marketing surfaces");
