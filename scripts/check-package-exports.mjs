#!/usr/bin/env node
/**
 * Post-build guard (run after `pnpm build`):
 * 1. Every package.json "exports" target file exists on disk.
 * 2. Every @eristack/* subpath import in workspace source is declared on the target package.
 *
 * Prevents shipping npm tarballs where spine packages import e.g.
 * @eristack/backseat/adapters but the export map omits ./adapters (Vite pre-bundle failure).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

const IMPORT_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+\s+from\s+)?["']@eristack\/([^/"']+)(\/[^"']+)?["']/g;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** packages/<category>/<slug> publishable @eristack packages */
function listPackages() {
  const found = [];
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
      const pkgDir = path.join(categoryDir, pkgEntry.name);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = readJson(pkgJsonPath);
      const name = String(pkgJson.name ?? "");
      if (!name.startsWith("@eristack/")) continue;
      found.push({ name, pkgDir, pkgJson });
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

function collectPathsFromCondition(condition) {
  if (!condition) return [];
  if (typeof condition === "string") return [condition];
  const paths = [];
  if (condition.default) paths.push(condition.default);
  if (condition.types) paths.push(condition.types);
  return paths;
}

function collectExportArtifactPaths(exportsField) {
  const paths = new Set();
  if (!exportsField || typeof exportsField !== "object") return paths;

  for (const value of Object.values(exportsField)) {
    if (typeof value === "string") {
      paths.add(value);
      continue;
    }
    for (const condition of collectPathsFromCondition(value.import)) {
      paths.add(condition);
    }
    for (const condition of collectPathsFromCondition(value.require)) {
      paths.add(condition);
    }
    if (value.types) paths.add(value.types);
  }
  return paths;
}

function listSourceFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const skip = new Set(["node_modules", "dist", ".turbo"]);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function readTsupEntrySubpaths(pkgDir) {
  const tsupPath = path.join(pkgDir, "tsup.config.ts");
  if (!fs.existsSync(tsupPath)) return null;
  const raw = fs.readFileSync(tsupPath, "utf8");
  const match = raw.match(/entry:\s*\[([\s\S]*?)\]/);
  if (!match?.[1]) return null;

  const entries = [];
  for (const m of match[1].matchAll(/["']([^"']+)["']/g)) {
    entries.push(m[1]);
  }
  return entries.map((entry) => {
    if (entry === "src/index.ts") return ".";
    let sub = entry.replace(/^src\//, "").replace(/\.(tsx?|mts|cts)$/, "");
    if (sub.endsWith("/index")) sub = sub.slice(0, -"/index".length);
    return `./${sub}`;
  });
}

function exportKeyToSubpath(key) {
  if (key === ".") return ".";
  return key.startsWith("./") ? key : `./${key}`;
}

function main() {
  const packages = listPackages();
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const errors = [];

  for (const pkg of packages) {
    const exportsField = pkg.pkgJson.exports;
    if (!exportsField || typeof exportsField !== "object") continue;

    const exportKeys = Object.keys(exportsField).map(exportKeyToSubpath);
    const artifactPaths = collectExportArtifactPaths(exportsField);

    for (const rel of artifactPaths) {
      const abs = path.join(pkg.pkgDir, rel);
      if (!fs.existsSync(abs)) {
        errors.push(
          `${pkg.name}: export artifact missing on disk: ${rel} (run pnpm build)`,
        );
      }
    }

    const tsupSubpaths = readTsupEntrySubpaths(pkg.pkgDir);
    if (tsupSubpaths) {
      for (const sub of exportKeys) {
        if (sub === ".") continue;
        if (!tsupSubpaths.includes(sub)) {
          errors.push(
            `${pkg.name}: package.json exports ${sub} but tsup.config.ts has no matching entry (add src/${sub.slice(2)}/index.ts or src/${sub.slice(2)}.ts)`,
          );
        }
      }
    }
  }

  const internalImports = new Map();
  for (const pkg of packages) {
    const scanRoots = [
      path.join(pkg.pkgDir, "src"),
      path.join(pkg.pkgDir, "tests"),
    ];
    for (const root of scanRoots) {
      for (const file of listSourceFiles(root)) {
        const text = fs.readFileSync(file, "utf8");
        for (const match of text.matchAll(IMPORT_RE)) {
          const shortName = match[1];
          const subpath = match[2] ?? "";
          const targetName = `@eristack/${shortName}`;
          const exportKey = subpath ? `.${subpath}` : ".";
          if (!byName.has(targetName)) continue;
          if (targetName === pkg.name) continue;

          const key = `${targetName}|${exportKey}`;
          if (!internalImports.has(key)) {
            internalImports.set(key, []);
          }
          internalImports.get(key).push(path.relative(repoRoot, file));
        }
      }
    }
  }

  for (const [key, refs] of internalImports) {
    const [targetName, exportKey] = key.split("|");
    const target = byName.get(targetName);
    const exportsField = target?.pkgJson.exports;
    if (!exportsField || typeof exportsField !== "object") {
      errors.push(
        `${targetName}: imported as ${exportKey} from ${refs[0]} but package has no exports map`,
      );
      continue;
    }
    if (!(exportKey in exportsField)) {
      errors.push(
        `${targetName}: missing exports[${JSON.stringify(exportKey)}] — imported from ${refs.slice(0, 3).join(", ")}${refs.length > 3 ? ` (+${refs.length - 3} more)` : ""}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("Package export validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(
      "\nFix exports + tsup entries, rebuild, then re-run: pnpm exports:check",
    );
    process.exit(1);
  }

  console.log(
    `OK — ${packages.length} packages, ${internalImports.size} internal @eristack subpath imports validated`,
  );
}

main();
