#!/usr/bin/env node
/**
 * STAB-AI-AGENTS: root intent.skills, packages with skills/, and AGENTS.md block stay aligned.
 *
 * Usage: node scripts/check-agents-intent-sync.mjs [--ci]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listEristackPackages } from "./lib/list-eristack-packages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const ci = process.argv.includes("--ci");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function findSkillFiles(pkgDir) {
  const skillsDir = path.join(pkgDir, "skills");
  if (!fs.existsSync(skillsDir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const skillPath = path.join(skillsDir, entry.name, "SKILL.md");
      if (fs.existsSync(skillPath)) found.push(skillPath);
      continue;
    }
    if (entry.name === "SKILL.md") found.push(path.join(skillsDir, entry.name));
  }
  return found;
}

function skillNameFromFrontmatter(skillPath) {
  const content = fs.readFileSync(skillPath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const nameLine = match[1].match(/^name:\s*(.+)$/m);
  if (!nameLine) return null;
  return nameLine[1].trim().replace(/^["']|["']$/g, "");
}

function expectedSkillIds() {
  const ids = new Set();
  const packages = listEristackPackages(repoRoot, { hasSkills: true });
  for (const pkg of packages) {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, pkg.relDir, "package.json"), "utf8"),
    );
    const packageName = pkgJson.name;
    if (!packageName?.startsWith("@eristack/")) continue;
    const pkgDir = path.join(repoRoot, pkg.relDir);
    for (const skillPath of findSkillFiles(pkgDir)) {
      const skillName = skillNameFromFrontmatter(skillPath);
      if (!skillName) {
        throw new Error(
          `Missing name: in frontmatter — ${path.relative(repoRoot, skillPath)}`,
        );
      }
      ids.add(`${packageName}#${skillName}`);
    }
  }
  return ids;
}

function intentSkillPackages() {
  const root = readJson("package.json");
  const entries = root.intent?.skills ?? [];
  return new Set(
    entries.map((entry) => {
      const raw = String(entry).replace(/^workspace:/, "");
      if (!raw.startsWith("@eristack/")) {
        throw new Error(`intent.skills entry is not @eristack/*: ${entry}`);
      }
      return raw;
    }),
  );
}

function agentsBlockSkillIds() {
  const agentsPath = path.join(repoRoot, "AGENTS.md");
  const text = fs.readFileSync(agentsPath, "utf8");
  const start = "<!-- intent-skills:start -->";
  const end = "<!-- intent-skills:end -->";
  const i0 = text.indexOf(start);
  const i1 = text.indexOf(end);
  if (i0 < 0 || i1 < 0 || i1 <= i0) {
    throw new Error("AGENTS.md missing intent-skills start/end markers");
  }
  const block = text.slice(i0 + start.length, i1);
  const ids = new Set();
  for (const match of block.matchAll(/^\s*- id: "(@eristack\/[^#]+#[^"]+)"/gm)) {
    ids.add(match[1]);
  }
  return ids;
}

function fail(message) {
  console.error(message);
  if (ci) process.exit(1);
}

const packagesWithSkills = new Set(
  listEristackPackages(repoRoot, { hasSkills: true }).map((p) => p.name),
);
const intentPackages = intentSkillPackages();
const expectedIds = expectedSkillIds();
const agentsIds = agentsBlockSkillIds();

const missingFromIntent = [...packagesWithSkills].filter(
  (name) => !intentPackages.has(name),
);
const extraInIntent = [...intentPackages].filter(
  (name) => !packagesWithSkills.has(name),
);

const missingInAgents = [...expectedIds].filter((id) => !agentsIds.has(id));
const extraInAgents = [...agentsIds].filter((id) => !expectedIds.has(id));

let ok = true;

if (missingFromIntent.length) {
  ok = false;
  fail(
    `intent.skills missing workspace entries for packages with skills/:\n  ${missingFromIntent.join("\n  ")}`,
  );
}
if (extraInIntent.length) {
  ok = false;
  fail(
    `intent.skills lists packages without skills/:\n  ${extraInIntent.join("\n  ")}`,
  );
}
if (missingInAgents.length) {
  ok = false;
  fail(
    `AGENTS.md intent block missing skill ids (run pnpm exec intent install --map):\n  ${missingInAgents.slice(0, 20).join("\n  ")}${missingInAgents.length > 20 ? `\n  … +${missingInAgents.length - 20} more` : ""}`,
  );
}
if (extraInAgents.length) {
  ok = false;
  fail(
    `AGENTS.md intent block has stale skill ids:\n  ${extraInAgents.slice(0, 20).join("\n  ")}${extraInAgents.length > 20 ? `\n  … +${extraInAgents.length - 20} more` : ""}`,
  );
}

if (!ok) process.exit(ci ? 1 : 0);

console.log(
  `check-agents-intent-sync: OK (${expectedIds.size} skills, ${intentPackages.size} intent packages)`,
);
