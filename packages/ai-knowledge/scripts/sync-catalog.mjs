import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const packagesDir = path.join(repoRoot, "packages");
const catalogOut = path.join(packageRoot, "src/generated/catalog.ts");
const recipesOut = path.join(packageRoot, "src/generated/recipes.ts");
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

function listSiblingPackages() {
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== "ai-knowledge")
    .sort();
}

function collectCatalog() {
  const packages = [];

  for (const slug of listSiblingPackages()) {
    const pkgDir = path.join(packagesDir, slug);
    const pkgJsonPath = path.join(pkgDir, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = readJson(pkgJsonPath);
    const name = String(pkgJson.name ?? "");
    if (!name.startsWith("@eristack/")) continue;

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

function validateRecipes(recipes, catalog) {
  const packageNames = new Set(catalog.map((pkg) => pkg.name));
  const skillIds = new Set(
    catalog.flatMap((pkg) =>
      pkg.skills.map((skill) => `${pkg.name}#${skill.id}`),
    ),
  );

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
  const lines = [];
  for (const pkg of catalog) {
    lines.push(`### ${pkg.name} (v${pkg.version})`);
    lines.push("");
    lines.push(pkg.description || "_No description_");
    lines.push("");
    if (pkg.adapters.length > 0) {
      lines.push(`Adapters: ${pkg.adapters.map((a) => `\`${a}\``).join(", ")}`);
      lines.push("");
    }
    if (pkg.skills.length === 0) {
      lines.push("_No Intent skills yet._");
      lines.push("");
      continue;
    }
    for (const skill of pkg.skills) {
      lines.push(`- \`${pkg.name}#${skill.id}\` — ${skill.description}`);
      lines.push(`  - Load: \`${skill.loadCommand}\``);
    }
    lines.push("");
  }
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

function normalizeGeneratedForCheck(content) {
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

  const recipes = loadRecipes();
  validateRecipes(recipes, catalog);

  const catalogTs = renderCatalogTs(catalog);
  const recipesTs = renderRecipesTs(recipes);
  const skillUpdate = updateRecommendSkill(catalog);

  let ok = true;
  if (CHECK) {
    const existingCatalog = fs.existsSync(catalogOut)
      ? fs.readFileSync(catalogOut, "utf8")
      : "";
    const nextNorm = normalizeGeneratedForCheck(catalogTs);
    const prevNorm = normalizeGeneratedForCheck(existingCatalog);
    if (nextNorm !== prevNorm) {
      console.error(`Drift detected: ${path.relative(repoRoot, catalogOut)}`);
      ok = false;
    }
    ok = writeOrCheck(recipesOut, recipesTs) && ok;
    if (skillUpdate) ok = writeOrCheck(recommendSkillPath, skillUpdate) && ok;
  } else {
    ok = writeOrCheck(catalogOut, catalogTs) && ok;
    ok = writeOrCheck(recipesOut, recipesTs) && ok;
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
