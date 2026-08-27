/**
 * Discover publishable packages that ship docs/ (source of truth for docs:check/sync).
 */
import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} repoRoot
 * @returns {{ directory: string; slug: string }[]}
 */
export function listDocPackages(repoRoot) {
  const packagesDir = path.join(repoRoot, "packages");
  /** @type {{ directory: string; slug: string }[]} */
  const found = [];

  if (!fs.existsSync(packagesDir)) return found;

  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);

    for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, entry.name);
      const docsDir = path.join(pkgDir, "docs");
      if (!fs.existsSync(docsDir)) continue;

      found.push({
        directory: path.relative(repoRoot, pkgDir),
        slug: entry.name,
      });
    }
  }

  return found.sort((a, b) => a.slug.localeCompare(b.slug));
}
