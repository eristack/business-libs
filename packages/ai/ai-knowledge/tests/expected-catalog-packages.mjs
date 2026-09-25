import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const packagesDir = path.join(repoRoot, "packages");
const SELF = "@eristack/ai-knowledge";

/** Same discovery rules as scripts/sync-catalog.mjs listSiblingPackages(). */
export function expectedCatalogPackageNames() {
  const found = [];
  for (const categoryEntry of fs.readdirSync(packagesDir, {
    withFileTypes: true,
  })) {
    if (!categoryEntry.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, categoryEntry.name);
    for (const pkgEntry of fs.readdirSync(categoryDir, {
      withFileTypes: true,
    })) {
      if (!pkgEntry.isDirectory()) continue;
      const pkgJsonPath = path.join(
        categoryDir,
        pkgEntry.name,
        "package.json",
      );
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.private === true) continue;
      const name = String(pkgJson.name ?? "");
      if (name === SELF || !name.startsWith("@eristack/")) continue;
      found.push(name);
    }
  }
  return found.sort();
}
