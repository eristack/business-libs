#!/usr/bin/env node
/**
 * Phase-0 debottleneck report: publish deps, recipe trigger overlap, spine inventory.
 * Non-failing by default; use --strict to exit 1 on workspace deps in dependencies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(repoRoot, "packages");
const recipesPath = path.join(
  repoRoot,
  "packages/ai/ai-knowledge/knowledge/recipes.yaml",
);
const STRICT = process.argv.includes("--strict");
const JSON_OUT = process.argv.includes("--json");

function listEristackPackages() {
  const found = [];
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, entry.name);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.private) continue;
      const name = String(pkgJson.name ?? "");
      if (!name.startsWith("@eristack/")) continue;
      found.push({ name, pkgDir, pkgJson });
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

function workspaceDepViolations(packages) {
  const violations = [];
  for (const { name, pkgJson } of packages) {
    const deps = pkgJson.dependencies ?? {};
    for (const [dep, spec] of Object.entries(deps)) {
      if (dep.startsWith("@eristack/") && String(spec).includes("workspace:")) {
        violations.push({ package: name, dep, spec });
      }
    }
  }
  return violations;
}

function parseRecipeTriggersFromYaml(text) {
  /** @type {{ id: string, triggers: string[] }[]} */
  const recipes = [];
  let current = null;
  let inTriggers = false;
  for (const line of text.split("\n")) {
    const idMatch = line.match(/^  - id: (\S+)/);
    if (idMatch) {
      if (current) recipes.push(current);
      current = { id: idMatch[1], triggers: [] };
      inTriggers = false;
      continue;
    }
    if (!current) continue;
    if (/^    triggers:/.test(line)) {
      inTriggers = true;
      continue;
    }
    if (inTriggers) {
      const triggerMatch = line.match(/^      - (.+)/);
      if (triggerMatch) {
        current.triggers.push(triggerMatch[1].trim().toLowerCase());
        continue;
      }
      if (/^    [a-z]/i.test(line) && !/^      /.test(line)) {
        inTriggers = false;
      }
    }
  }
  if (current) recipes.push(current);
  return recipes;
}

function recipeTriggerOverlap() {
  const recipes = parseRecipeTriggersFromYaml(
    fs.readFileSync(recipesPath, "utf8"),
  );
  const byTrigger = new Map();
  for (const recipe of recipes) {
    for (const trigger of recipe.triggers) {
      const key = String(trigger).toLowerCase();
      if (!byTrigger.has(key)) byTrigger.set(key, []);
      byTrigger.get(key).push(recipe.id);
    }
  }
  const overlaps = [];
  for (const [trigger, ids] of byTrigger) {
    if (ids.length > 1) {
      overlaps.push({ trigger, recipeIds: [...new Set(ids)].sort() });
    }
  }
  overlaps.sort((a, b) => b.recipeIds.length - a.recipeIds.length);
  return overlaps;
}

function countBackseatRegisters() {
  let registerFiles = 0;
  let routeFiles = 0;
  for (const { pkgDir } of listEristackPackages()) {
    const backseatDir = path.join(pkgDir, "src/backseat");
    if (!fs.existsSync(backseatDir)) continue;
    for (const file of fs.readdirSync(backseatDir)) {
      if (file === "register.ts") registerFiles += 1;
      if (file.endsWith("-routes.ts")) routeFiles += 1;
    }
  }
  return { registerFiles, routeFiles };
}

function main() {
  const packages = listEristackPackages();
  const violations = workspaceDepViolations(packages);
  const overlaps = recipeTriggerOverlap();
  const spine = countBackseatRegisters();
  const topOverlaps = overlaps.slice(0, 15);

  const report = {
    packageCount: packages.length,
    workspaceDepViolations: violations,
    recipeTriggerOverlapCount: overlaps.length,
    topRecipeOverlaps: topOverlaps,
    backseatRegisterFiles: spine.registerFiles,
    backseatRouteFiles: spine.routeFiles,
  };

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Eristack debottleneck report\n");
    console.log(`Packages: ${report.packageCount}`);
    console.log(
      `Backseat: ${spine.registerFiles} register.ts, ${spine.routeFiles} *-routes.ts\n`,
    );
    if (violations.length === 0) {
      console.log("Workspace deps in dependencies: none");
    } else {
      console.log("Workspace deps in dependencies (move to peer + dev):");
      for (const v of violations) {
        console.log(`  - ${v.package}: ${v.dep} (${v.spec})`);
      }
    }
    console.log(
      `\nRecipe trigger overlaps: ${overlaps.length} (showing top ${topOverlaps.length})`,
    );
    for (const row of topOverlaps) {
      console.log(`  - "${row.trigger}" → ${row.recipeIds.join(", ")}`);
    }
  }

  if (STRICT && violations.length > 0) {
    process.exit(1);
  }
}

main();
