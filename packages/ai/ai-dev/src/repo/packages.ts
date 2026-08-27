import fs from "node:fs";
import path from "node:path";

export type EristackPackage = {
  name: string;
  dir: string;
  relDir: string;
  category: string;
  slug: string;
  version?: string;
  description?: string;
  hasDocs: boolean;
  hasSkills: boolean;
  hasTicket: boolean;
};

export type ListPackagesOptions = {
  excludeName?: string;
  hasDocs?: boolean;
  hasSkills?: boolean;
  hasTicket?: boolean;
};

function readJson(filePath: string): {
  name?: string;
  version?: string;
  description?: string;
} {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** packages/<category>/<slug> publishable @eristack/* packages. */
export function listEristackPackages(
  repoRoot: string,
  options: ListPackagesOptions = {},
): EristackPackage[] {
  const packagesDir = path.join(repoRoot, "packages");
  const found: EristackPackage[] = [];
  if (!fs.existsSync(packagesDir)) return found;

  for (const categoryEntry of fs.readdirSync(packagesDir, {
    withFileTypes: true,
  })) {
    if (!categoryEntry.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, categoryEntry.name);

    for (const pkgEntry of fs.readdirSync(categoryDir, {
      withFileTypes: true,
    })) {
      if (!pkgEntry.isDirectory()) continue;
      const dir = path.join(categoryDir, pkgEntry.name);
      const pkgJsonPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;

      const pkgJson = readJson(pkgJsonPath);
      const name = String(pkgJson.name ?? "");
      if (!name.startsWith("@eristack/")) continue;
      if (options.excludeName && name === options.excludeName) continue;

      const hasDocs = fs.existsSync(path.join(dir, "docs"));
      const hasSkills = fs.existsSync(path.join(dir, "skills"));
      const hasTicket = fs.existsSync(path.join(dir, "ticket.yaml"));

      if (options.hasDocs === true && !hasDocs) continue;
      if (options.hasSkills === true && !hasSkills) continue;
      if (options.hasTicket === true && !hasTicket) continue;

      found.push({
        name,
        dir,
        relDir: path.relative(repoRoot, dir),
        category: categoryEntry.name,
        slug: pkgEntry.name,
        version:
          typeof pkgJson.version === "string" ? pkgJson.version : undefined,
        description:
          typeof pkgJson.description === "string"
            ? pkgJson.description
            : undefined,
        hasDocs,
        hasSkills,
        hasTicket,
      });
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name));
}

export function packagesFromPaths(
  repoRoot: string,
  paths: string[],
): string[] {
  const all = listEristackPackages(repoRoot);
  const names = new Set<string>();

  for (const rel of paths) {
    const normalized = rel.replace(/\\/g, "/");
    for (const pkg of all) {
      const prefix = `${pkg.relDir}/`;
      if (normalized === pkg.relDir || normalized.startsWith(prefix)) {
        names.add(pkg.name);
      }
    }
    if (normalized.startsWith("apps/web/")) {
      names.add("@eristack/web");
    }
  }

  return [...names].sort();
}
