import fs from "node:fs";
import path from "node:path";

export function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find pnpm-workspace.yaml (repo root)");
    }
    dir = parent;
  }
}

export function findPackageDir(
  repoRoot: string,
  packageName: string,
): string | null {
  const packagesDir = path.join(repoRoot, "packages");
  if (!fs.existsSync(packagesDir)) return null;
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const pkg of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!pkg.isDirectory()) continue;
      const dir = path.join(categoryDir, pkg.name);
      const pkgJsonPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const name = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")).name;
      if (name === packageName) return dir;
    }
  }
  return null;
}
