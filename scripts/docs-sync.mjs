#!/usr/bin/env node
/**
 * Sync docs/_meta.json pages + sections from on-disk markdown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocSlugs, syncMeta } from "./doc-meta-lib.mjs";
import { listDocPackages } from "./doc-packages.mjs";
import { checkWebSitePackages } from "./web-site-check.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC_PACKAGES = listDocPackages(repoRoot);

function main() {
  let updated = 0;

  for (const { directory, slug } of DOC_PACKAGES) {
    const docsDir = path.join(repoRoot, directory, "docs");
    const metaPath = path.join(docsDir, "_meta.json");

    if (!fs.existsSync(docsDir)) continue;

    const diskSlugs = discoverDocSlugs(docsDir, fs);
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
      : { title: slug, pages: [] };

    const next = syncMeta(meta, diskSlugs);
    const prev = JSON.stringify(meta, null, 2) + "\n";
    const out = JSON.stringify(next, null, 2) + "\n";

    if (prev !== out) {
      fs.writeFileSync(metaPath, out);
      updated++;
      console.log(
        `↻ ${slug} — synced pages (${next.pages.length}) + sections (${next.sections.length})`,
      );
    } else {
      console.log(`· ${slug} — already in sync`);
    }
  }

  console.log(`\nDone — ${updated} _meta.json file(s) updated`);

  const webSite = checkWebSitePackages();
  if (!webSite.ok) {
    if (webSite.missing.length > 0) {
      console.warn(
        `\n⚠ site.ts missing ${webSite.missing.length} package(s): ${webSite.missing.join(", ")}`,
      );
      console.warn("  Add entries to apps/web/src/lib/site.ts (versions/changelogs auto-detect at build).");
    }
    if (webSite.extra.length > 0) {
      console.warn(`\n⚠ site.ts extra slug(s): ${webSite.extra.join(", ")}`);
    }
  } else {
    console.log(`✓ web site.ts — ${webSite.total} packages listed`);
  }
}

main();
