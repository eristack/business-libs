#!/usr/bin/env node
/**
 * Fail CI when publishable @eristack/* packages declare workspace:* in dependencies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

function listPublishablePackages() {
  const found = [];
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const slug of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, slug.name);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.private) continue;
      if (!String(pkgJson.name ?? "").startsWith("@eristack/")) continue;
      found.push({ name: pkgJson.name, pkgDir, pkgJson });
    }
  }
  return found;
}

const errors = [];
for (const pkg of listPublishablePackages()) {
  const deps = pkg.pkgJson.dependencies ?? {};
  for (const [dep, version] of Object.entries(deps)) {
    if (String(version).startsWith("workspace:")) {
      errors.push(
        `${pkg.name}: dependencies["${dep}"] = "${version}" — move to peerDependencies + devDependencies`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("check-publish-deps: FAILED\n");
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log("check-publish-deps: OK");
