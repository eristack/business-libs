#!/usr/bin/env node
/**
 * Ensure apps/web/src/lib/site.ts lists every publishable @eristack/* package.
 * Versions/changelogs are read live from package.json + CHANGELOG.md at build time.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listEristackPackages } from "./lib/list-eristack-packages.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = path.join(repoRoot, "apps/web/src/lib/site.ts");

/** @param {string} source */
function extractSiteSlugs(source) {
  const slugs = new Set();
  const re = /^\s+slug:\s+"([^"]+)"/gm;
  let match;
  while ((match = re.exec(source)) !== null) {
    slugs.add(match[1]);
  }
  return slugs;
}

/**
 * @param {{ check?: boolean }} [options]
 * @returns {{ ok: boolean; missing: string[]; extra: string[]; total: number }}
 */
export function checkWebSitePackages(options = {}) {
  const discovered = listEristackPackages(repoRoot).map((pkg) => pkg.slug);
  const discoveredSet = new Set(discovered);

  if (!fs.existsSync(sitePath)) {
    return {
      ok: false,
      missing: [...discoveredSet],
      extra: [],
      total: discovered.length,
    };
  }

  const siteSource = fs.readFileSync(sitePath, "utf8");
  const siteSlugs = extractSiteSlugs(siteSource);

  const missing = discovered.filter((slug) => !siteSlugs.has(slug));
  const extra = [...siteSlugs].filter((slug) => !discoveredSet.has(slug));

  return {
    ok: missing.length === 0 && extra.length === 0,
    missing,
    extra,
    total: discovered.length,
  };
}

function main() {
  const check = process.argv.includes("--check");
  const result = checkWebSitePackages({ check });

  if (result.missing.length === 0 && result.extra.length === 0) {
    console.log(`✓ web site.ts — ${result.total} packages in sync with monorepo`);
    return;
  }

  if (result.missing.length > 0) {
    console.error("✗ site.ts missing packages (add to apps/web/src/lib/site.ts):");
    for (const slug of result.missing) {
      console.error(`    - ${slug}`);
    }
  }

  if (result.extra.length > 0) {
    console.error("✗ site.ts lists packages not found under packages/:");
    for (const slug of result.extra) {
      console.error(`    - ${slug}`);
    }
  }

  console.error(
    "\nRun `pnpm docs:sync` after updating site.ts, then `pnpm docs:check`.",
  );
  process.exit(1);
}

if (process.argv[1]?.endsWith("web-site-check.mjs")) {
  main();
}
