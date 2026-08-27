import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find pnpm-workspace.yaml above package root");
    }
    dir = parent;
  }
}

const repoRoot = findRepoRoot(packageRoot);
const packagesDir = path.join(repoRoot, "packages");
const catalogOut = path.join(packageRoot, "src/generated/catalog.ts");
const recipesOut = path.join(packageRoot, "src/generated/recipes.ts");
const localSkillsOut = path.join(packageRoot, "src/generated/local-skills.ts");
const recipesYamlPath = path.join(packageRoot, "knowledge/recipes.yaml");
const recommendSkillPath = path.join(
  packageRoot,
  "skills/recommend-eristack/SKILL.md",
);

const CHECK = process.argv.includes("--check");
const SELF_NAME = "@eristack/ai-knowledge";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return {};
  return YAML.parse(match[1]) ?? {};
}

function foldDescription(value) {
  return value.replace(/\s+/g, " ").trim();
}

/** packages/<category>/<slug> — category folders are not packages themselves. */
function listSiblingPackages() {
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
      if (pkgJson.private === true) continue;
      if (name === SELF_NAME) continue;
      if (!name.startsWith("@eristack/")) continue;
      found.push({
        slug: pkgEntry.name,
        category: categoryEntry.name,
        pkgDir,
        pkgJson,
        name,
      });
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name));
}

function collectCatalog() {
  const packages = [];

  for (const sibling of listSiblingPackages()) {
    const { slug, pkgDir, pkgJson, name } = sibling;
    const exports =
      pkgJson.exports && typeof pkgJson.exports === "object"
        ? pkgJson.exports
        : {};
    const adapters = Object.keys(exports)
      .filter((key) => key !== "." && key.startsWith("./"))
      .map((key) => key.slice(2))
      .sort();

    const skillsDir = path.join(pkgDir, "skills");
    const skills = [];
    if (fs.existsSync(skillsDir)) {
      const skillDirs = fs
        .readdirSync(skillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

      for (const skillName of skillDirs) {
        const skillFile = path.join(skillsDir, skillName, "SKILL.md");
        if (!fs.existsSync(skillFile)) continue;
        const fm = parseFrontmatter(fs.readFileSync(skillFile, "utf8"));
        const resolvedName = fm.name ?? skillName;
        skills.push({
          id: resolvedName,
          name: resolvedName,
          packageName: name,
          description: foldDescription(fm.description ?? ""),
          type: fm.metadata?.type ?? "core",
          loadCommand: `pnpm dlx @tanstack/intent@latest load ${name}#${resolvedName}`,
        });
      }
    }

    packages.push({
      name,
      version: String(pkgJson.version ?? "0.0.0"),
      description: String(pkgJson.description ?? ""),
      slug,
      adapters,
      skills,
    });
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

function loadRecipes() {
  const raw = YAML.parse(fs.readFileSync(recipesYamlPath, "utf8")) ?? {};
  const recipes = raw.recipes ?? [];
  return recipes.map((recipe) => ({
    ...recipe,
    rationale: foldDescription(recipe.rationale),
    triggers: recipe.triggers.map((trigger) => trigger.toLowerCase()),
  }));
}

function collectLocalSkills() {
  const skillsDir = path.join(packageRoot, "skills");
  const skills = [];
  if (!fs.existsSync(skillsDir)) return skills;

  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of skillDirs) {
    const skillFile = path.join(skillsDir, skillName, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    const fm = parseFrontmatter(fs.readFileSync(skillFile, "utf8"));
    const resolvedName = fm.name ?? skillName;
    skills.push({
      id: resolvedName,
      name: resolvedName,
      packageName: SELF_NAME,
      description: foldDescription(fm.description ?? ""),
      type: fm.metadata?.type ?? "core",
      loadCommand: `pnpm dlx @tanstack/intent@latest load ${SELF_NAME}#${resolvedName}`,
    });
  }
  return skills;
}

function renderLocalSkillsTs(localSkills) {
  return `// AUTO-GENERATED — run pnpm knowledge:sync
// Do not edit by hand.

import type { CatalogSkill } from "../types.js";

export const localSkills = ${JSON.stringify(localSkills, null, 2)} as CatalogSkill[];
`;
}

function validateRecipes(recipes, catalog, localSkills) {
  const packageNames = new Set(catalog.map((pkg) => pkg.name));
  packageNames.add(SELF_NAME);
  const skillIds = new Set([
    ...catalog.flatMap((pkg) =>
      pkg.skills.map((skill) => `${pkg.name}#${skill.id}`),
    ),
    ...localSkills.map((skill) => `${skill.packageName}#${skill.id}`),
  ]);

  const errors = [];
  for (const recipe of recipes) {
    for (const ref of recipe.packages) {
      if (!packageNames.has(ref.name)) {
        errors.push(
          `recipe "${recipe.id}" references unknown package ${ref.name}`,
        );
      }
      for (const skill of ref.skills) {
        const key = `${ref.name}#${skill}`;
        if (!skillIds.has(key)) {
          errors.push(
            `recipe "${recipe.id}" references unknown skill ${key}`,
          );
        }
      }
    }
    for (const ref of recipe.canonicalSkills ?? []) {
      if (!skillIds.has(ref)) {
        errors.push(
          `recipe "${recipe.id}" references unknown canonicalSkill ${ref}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Recipe validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

function renderCatalogTs(catalog) {
  const payload = {
    generatedAt: new Date().toISOString(),
    packages: catalog,
  };
  return `// AUTO-GENERATED — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { KnowledgeCatalog } from "../types.js";

export const catalog = ${JSON.stringify(payload, null, 2)} as KnowledgeCatalog;
`;
}

function renderRecipesTs(recipes) {
  return `// AUTO-GENERATED from knowledge/recipes.yaml — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { Recipe } from "../types.js";

export const recipes = ${JSON.stringify(recipes, null, 2)} as Recipe[];
`;
}

function renderCatalogMarkdown(catalog) {
  const lines = [
    `**${catalog.length} sibling packages** — full machine-readable catalog: \`getCatalog()\` from \`@eristack/ai-knowledge\` or run \`pnpm knowledge:sync\`.`,
    "",
    "| Package | Skills |",
    "| --- | ---: |",
  ];
  for (const pkg of catalog) {
    lines.push(`| ${pkg.name} | ${pkg.skills.length} |`);
  }
  lines.push("");
  lines.push(
    "Load `@eristack/ai-knowledge#recommend-eristack` then `loadPlan(goals)` — canonical ERP guides merge via `canonicalSkills` on recipes.",
  );
  return lines.join("\n").trimEnd() + "\n";
}

function updateRecommendSkill(catalog) {
  if (!fs.existsSync(recommendSkillPath)) return null;
  const raw = fs.readFileSync(recommendSkillPath, "utf8");
  const start = "<!-- catalog:start -->";
  const end = "<!-- catalog:end -->";
  const startIdx = raw.indexOf(start);
  const endIdx = raw.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `Missing ${start} / ${end} markers in skills/recommend-eristack/SKILL.md`,
    );
  }
  const before = raw.slice(0, startIdx + start.length);
  const after = raw.slice(endIdx);
  return `${before}\n\n${renderCatalogMarkdown(catalog)}\n${after}`;
}

function writeOrCheck(filePath, next) {
  const prev = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (CHECK) {
    if (prev !== next) {
      console.error(`Drift detected: ${path.relative(repoRoot, filePath)}`);
      return false;
    }
    return true;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, next, "utf8");
  console.log(`Wrote ${path.relative(repoRoot, filePath)}`);
  return true;
}

function normalizeMapForCheck(content) {
  return content.replace(
    /"generatedAt":\s*"[^"]*"/,
    '"generatedAt": "<ignored>"',
  );
}

function main() {
  const catalog = collectCatalog();
  if (catalog.some((pkg) => pkg.name === SELF_NAME)) {
    throw new Error("ai-knowledge must not catalog itself as a sibling package");
  }

  const localSkills = collectLocalSkills();
  const recipes = loadRecipes();
  validateRecipes(recipes, catalog, localSkills);

  const catalogTs = renderCatalogTs(catalog);
  const recipesTs = renderRecipesTs(recipes);
  const localSkillsTs = renderLocalSkillsTs(localSkills);
  const skillUpdate = updateRecommendSkill(catalog);

  let ok = true;
  if (CHECK) {
    const existingCatalog = fs.existsSync(catalogOut)
      ? fs.readFileSync(catalogOut, "utf8")
      : "";
    const nextNorm = normalizeMapForCheck(catalogTs);
    const prevNorm = normalizeMapForCheck(existingCatalog);
    if (nextNorm !== prevNorm) {
      console.error(`Drift detected: ${path.relative(repoRoot, catalogOut)}`);
      ok = false;
    }
    ok = writeOrCheck(recipesOut, recipesTs) && ok;
    ok = writeOrCheck(localSkillsOut, localSkillsTs) && ok;
    if (skillUpdate) ok = writeOrCheck(recommendSkillPath, skillUpdate) && ok;
  } else {
    ok = writeOrCheck(catalogOut, catalogTs) && ok;
    ok = writeOrCheck(recipesOut, recipesTs) && ok;
    ok = writeOrCheck(localSkillsOut, localSkillsTs) && ok;
    if (skillUpdate) ok = writeOrCheck(recommendSkillPath, skillUpdate) && ok;
  }

  if (!ok) {
    console.error(
      "\nCatalog is stale. Run: pnpm knowledge:sync (or pnpm --filter @eristack/ai-knowledge sync)",
    );
    process.exit(1);
  }

  console.log(
    CHECK
      ? `OK — catalog covers ${catalog.length} packages, ${recipes.length} recipes`
      : `Synced ${catalog.length} packages, ${recipes.length} recipes`,
  );
}

main();
