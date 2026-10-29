#!/usr/bin/env node
/**
 * Build the Agensi (agensi.io) upload ZIP from skills/ + knowledge/ + agensi/README.md + LICENSE.
 *
 *   pnpm --filter @eristack/ai-knowledge agensi:pack            # folder + zip
 *   node scripts/build-agensi-pack.mjs --no-zip                  # folder + checks only (tests)
 *
 * Output (gitignored): agensi-dist/eristack-ai-knowledge-pack/ and agensi-dist/eristack-ai-knowledge-pack.zip
 *
 * Skill names get an `eristack-` prefix (Agensi names are globally unique). The build fails when the
 * pack would exceed Agensi limits or ship client names, demo passwords, secrets, unpublished
 * @eristack packages, dead @eristack/<pkg>#<skill> anchors, or dead relative links.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8"));

const REPO = "https://github.com/eristack/business-libs";
const DOCS_URL = `${REPO}/tree/main/packages/ai/ai-knowledge`;
const PACK = "eristack-ai-knowledge-pack";
const outRoot = path.join(pkgRoot, "agensi-dist");
const packDir = path.join(outRoot, PACK);
const zipPath = path.join(outRoot, `${PACK}.zip`);

/** Monorepo-contributor or client-specific material — stays on npm, not in the public pack. */
const EXCLUDED_SKILLS = new Set(["dev-conventions", "tiga-sekawan-3ss-adoption"]);
const EXCLUDED_KNOWLEDGE = new Set(["dev-conventions.md", "tiga-sekawan-3ss-adoption.md"]);
const EXCLUDED_RECIPES = new Set(["tiga-sekawan-3ss-adopt"]);

const NAME_OVERRIDES = {
  "recommend-eristack": "eristack-recommend",
  "upgrading-eristack": "eristack-upgrading",
};

/** Names the guides explicitly describe as placeholders or not-yet-shipped packages. */
const UNPUBLISHED_ALLOWED = new Set([
  "feature-",
  "foo",
  "concurrency",
  "import-job",
  "weight",
  "volume",
  "party",
  "app-chrome",
  "fx-rate",
]);

const FORBIDDEN = [
  [/tiga|sekawan|\b3ss\b/i, "client name or batch code"],
  [/password123/i, "demo password"],
  [/\btickets\//, "internal ticket path"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\b(sk|rk)_(live|test)_[0-9a-zA-Z]{10,}/, "Stripe key"],
  [/\bnpm_[A-Za-z0-9]{36}\b/, "npm token"],
  [/\bgh[pousr]_[A-Za-z0-9]{36}\b/, "GitHub token"],
];

const LIMITS = { skills: 50, files: 1000, otherTextFiles: 200, chars: 6_000_000 };

const packName = (name) => NAME_OVERRIDES[name] ?? `eristack-${name}`;

function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error("missing frontmatter");
  return { data: YAML.parse(match[1]), body: text.slice(match[0].length) };
}

function oneLine(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.name === ".DS_Store") return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function loadValidAnchors() {
  const anchors = new Set();
  const packages = new Set([pkg.name]);
  for (const file of ["catalog.ts", "local-skills.ts"]) {
    const text = fs.readFileSync(path.join(pkgRoot, "src/generated", file), "utf8");
    for (const [, id] of text.matchAll(/intent@latest load (@eristack\/[a-z0-9-]+#[a-z0-9-]+)/g)) {
      anchors.add(id);
    }
    for (const [, name] of text.matchAll(/"(?:name|packageName)": "(@eristack\/[a-z0-9-]+)"/g)) {
      packages.add(name);
    }
  }
  return { anchors, packages };
}

function stripRecipes(text) {
  const lines = text.split("\n");
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    const id = line.match(/^  - id: (\S+)\s*$/)?.[1];
    if (id) skipping = EXCLUDED_RECIPES.has(id);
    else if (/^\S/.test(line)) skipping = false;
    if (!skipping) kept.push(line);
  }
  return kept.join("\n");
}

function renameBareSkillRefs(text, renames) {
  let out = text;
  for (const [from, to] of renames) {
    out = out.replaceAll(`\`${from}\``, `\`${to}\``);
  }
  return out;
}

function write(rel, contents) {
  const target = path.join(packDir, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function build() {
  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(packDir, { recursive: true });

  const skillDirs = fs
    .readdirSync(path.join(pkgRoot, "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !EXCLUDED_SKILLS.has(d.name))
    .map((d) => d.name)
    .sort();

  const skills = skillDirs.map((dir) => {
    const { data, body } = splitFrontmatter(
      fs.readFileSync(path.join(pkgRoot, "skills", dir, "SKILL.md"), "utf8"),
    );
    return { dir, original: data.name, name: packName(data.name), description: oneLine(data.description), body };
  });
  const renames = skills.map((s) => [s.original, s.name]);

  for (const skill of skills) {
    const frontmatter = YAML.stringify(
      { name: skill.name, description: skill.description, version: pkg.version, docs_url: DOCS_URL },
      { lineWidth: 0 },
    );
    const banner =
      `> Part of the **Eristack AI Knowledge Pack** (free, MIT). Same skill via TanStack Intent: ` +
      `\`pnpm add -D ${pkg.name}\` then \`pnpm dlx @tanstack/intent@latest load ${pkg.name}#${skill.original}\`.\n\n`;
    write(
      `skills/${skill.name}/SKILL.md`,
      `---\n${frontmatter}---\n\n${banner}${renameBareSkillRefs(skill.body.replace(/^\n+/, ""), renames)}`,
    );
  }

  const knowledgeRoot = path.join(pkgRoot, "knowledge");
  for (const file of walk(knowledgeRoot)) {
    const rel = path.relative(knowledgeRoot, file);
    if (EXCLUDED_KNOWLEDGE.has(rel)) continue;
    let text = fs.readFileSync(file, "utf8");
    if (rel === "recipes.yaml") text = stripRecipes(text);
    else text = renameBareSkillRefs(text, renames);
    write(path.join("knowledge", rel), text);
  }

  const table = [
    "| Skill | Use it for |",
    "| --- | --- |",
    ...skills.map((s) => `| \`${s.name}\` | ${s.description.split(/(?<=\.)\s/)[0].replaceAll("|", "\\|")} |`),
  ].join("\n");
  const readme = fs.readFileSync(path.join(pkgRoot, "agensi", "README.md"), "utf8");
  if (!readme.includes("<!-- skills:table -->")) throw new Error("agensi/README.md lost its <!-- skills:table --> marker");
  write("README.md", readme.replace("<!-- skills:table -->", table));
  write("LICENSE", fs.readFileSync(path.join(pkgRoot, "LICENSE"), "utf8"));

  return skills;
}

function validate(skills) {
  const errors = [];
  const files = walk(packDir);
  const rel = (f) => path.relative(packDir, f);
  const { anchors, packages } = loadValidAnchors();

  if (skills.length > LIMITS.skills) errors.push(`${skills.length} skills > Agensi limit ${LIMITS.skills}`);
  if (files.length > LIMITS.files) errors.push(`${files.length} files > ${LIMITS.files}`);
  const others = files.filter((f) => path.basename(f) !== "SKILL.md").length;
  if (others > LIMITS.otherTextFiles) errors.push(`${others} non-SKILL files > ${LIMITS.otherTextFiles} delivered`);

  const names = new Set();
  for (const s of skills) {
    if (!/^eristack-[a-z0-9-]+$/.test(s.name)) errors.push(`bad skill name ${s.name}`);
    if (names.has(s.name)) errors.push(`duplicate skill name ${s.name}`);
    names.add(s.name);
  }

  let chars = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    chars += text.length;
    const where = rel(file);

    for (const [pattern, label] of FORBIDDEN) {
      const hit = text.match(pattern);
      if (hit) errors.push(`${where}: ${label} (${hit[0]})`);
    }
    for (const [, name] of text.matchAll(/@eristack\/([a-z0-9-]+)/g)) {
      if (!packages.has(`@eristack/${name}`) && !UNPUBLISHED_ALLOWED.has(name)) {
        errors.push(`${where}: unpublished package @eristack/${name}`);
      }
    }
    for (const [id] of text.matchAll(/@eristack\/[a-z0-9-]+#[a-z0-9-]+/g)) {
      if (!anchors.has(id)) errors.push(`${where}: dead skill anchor ${id}`);
    }
    if (file.endsWith(".md")) {
      for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const resolved = path.resolve(path.dirname(file), target.split("#")[0]);
        if (!fs.existsSync(resolved)) errors.push(`${where}: dead link ${target}`);
      }
    }
  }
  if (chars > LIMITS.chars) errors.push(`${chars} chars > ${LIMITS.chars}`);

  const recipes = YAML.parse(fs.readFileSync(path.join(packDir, "knowledge/recipes.yaml"), "utf8"));
  for (const recipe of recipes.recipes ?? []) {
    if (EXCLUDED_RECIPES.has(recipe.id)) errors.push(`recipes.yaml still has ${recipe.id}`);
  }

  return { errors, files: files.length, chars };
}

const skills = build();
const { errors, files, chars } = validate(skills);
if (errors.length > 0) {
  console.error(`Agensi pack check failed (${errors.length}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

if (!process.argv.includes("--no-zip")) {
  execFileSync("zip", ["-r", "-X", "-q", zipPath, PACK, "-x", "*.DS_Store"], { cwd: outRoot });
}
fs.writeFileSync(
  path.join(outRoot, "manifest.json"),
  `${JSON.stringify(
    {
      version: pkg.version,
      zip: path.relative(pkgRoot, zipPath),
      files,
      chars,
      skills: skills.map((s) => ({ name: s.name, intent: `${pkg.name}#${s.original}` })),
      excluded: { skills: [...EXCLUDED_SKILLS], knowledge: [...EXCLUDED_KNOWLEDGE], recipes: [...EXCLUDED_RECIPES] },
    },
    null,
    2,
  )}\n`,
);
console.log(`OK — ${skills.length} skills, ${files} files, ${chars} chars → ${path.relative(pkgRoot, zipPath)}`);
