#!/usr/bin/env node
/**
 * Validate package docs/_meta.json against on-disk markdown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocSlugs, validateMeta } from "./doc-meta-lib.mjs";
import { listDocPackages } from "./doc-packages.mjs";
import { checkWebSitePackages } from "./web-site-check.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC_PACKAGES = listDocPackages(repoRoot);

function main() {
  let failed = false;

  for (const { directory, slug } of DOC_PACKAGES) {
    const docsDir = path.join(repoRoot, directory, "docs");
    const metaPath = path.join(docsDir, "_meta.json");

    if (!fs.existsSync(docsDir)) {
      console.error(`✗ ${slug}: docs folder missing`);
      failed = true;
      continue;
    }

    if (!fs.existsSync(metaPath)) {
      console.error(`✗ ${slug}: missing docs/_meta.json`);
      failed = true;
      continue;
    }

    const diskSlugs = discoverDocSlugs(docsDir, fs);
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const errors = validateMeta(meta, diskSlugs);

    if (errors.length > 0) {
      failed = true;
      console.error(`✗ ${slug}:`);
      for (const err of errors) {
        console.error(`    - ${err}`);
      }
    } else {
      console.log(
        `✓ ${slug} (${diskSlugs.length} pages, ${meta.sections.length} sections)`,
      );
    }
  }

  const webSite = checkWebSitePackages();
  if (!webSite.ok) {
    failed = true;
    if (webSite.missing.length > 0) {
      console.error("✗ site.ts missing packages:");
      for (const slug of webSite.missing) {
        console.error(`    - ${slug}`);
      }
    }
    if (webSite.extra.length > 0) {
      console.error("✗ site.ts extra packages:");
      for (const slug of webSite.extra) {
        console.error(`    - ${slug}`);
      }
    }
  } else {
    console.log(`✓ web site.ts (${webSite.total} packages)`);
  }

  if (failed) {
    console.error(
      "\nRun `pnpm docs:sync` to fix pages/sections, update site.ts for new packages, then commit.",
    );
    process.exit(1);
  }

  console.log(
    `\nOK — ${DOC_PACKAGES.length} doc catalogs + ${webSite.total} web packages validated`,
  );
}

main();
