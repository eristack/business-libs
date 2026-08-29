#!/usr/bin/env node
/**
 * Validate Intent skills for all @eristack packages (single source for skills:validate).
 * Also warns when a skill lists more than 3 sources unless ticket.yaml sets allowFatSkills: true.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const MAX_SOURCES = 3;

const PACKAGES = [
  "packages/primitive/money",
  "packages/primitive/timestamp",
  "packages/capability/doc-number",
  "packages/capability/qups",
  "packages/capability/stock-movement",
  "packages/capability/financial-ledger",
  "packages/capability/valuations",
  "packages/service/data-grid",
  "packages/service/jwt-auth",
  "packages/service/epoch",
  "packages/service/rbac",
  "packages/service/abac",
  "packages/service/pbac",
  "packages/service/hash-chained-ledger",
  "packages/infrastructure/backseat",
  "packages/infrastructure/logger",
  "packages/infrastructure/rest",
  "packages/ui/multitab",
  "packages/ai/ai-knowledge",
  "packages/ai/ai-workflow",
  "packages/ai/ai-ticket-generator",
  "packages/ai/ai-dev",
];

function readAllowFatSkills(pkgDir) {
  const ticketPath = path.join(pkgDir, "ticket.yaml");
  if (!fs.existsSync(ticketPath)) return false;
  const text = fs.readFileSync(ticketPath, "utf8");
  return /^\s*allowFatSkills:\s*true\s*$/m.test(text);
}

function countSkillSources(skillPath) {
  const content = fs.readFileSync(skillPath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return 0;
  const frontmatter = match[1];
  const sourcesBlock = frontmatter.match(/^sources:\r?\n((?:\s+-\s+.+\r?\n)+)/m);
  if (!sourcesBlock) return 0;
  return sourcesBlock[1].split(/\r?\n/).filter((line) => /^\s+-\s+/.test(line)).length;
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

const sourceWarnings = [];

for (const pkg of PACKAGES) {
  execSync(`pnpm exec intent validate ${pkg}`, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  const pkgDir = path.join(repoRoot, pkg);
  const allowFat = readAllowFatSkills(pkgDir);
  for (const skillPath of findSkillFiles(pkgDir)) {
    const count = countSkillSources(skillPath);
    if (count > MAX_SOURCES && !allowFat) {
      const rel = path.relative(repoRoot, skillPath);
      sourceWarnings.push(
        `${rel}: ${count} sources (max ${MAX_SOURCES}) — consolidate docs or set allowFatSkills: true in ticket.yaml`,
      );
    }
  }
}

if (sourceWarnings.length > 0) {
  console.error("\nskills-validate: source count failures\n");
  for (const warning of sourceWarnings) console.error(`  - ${warning}`);
  process.exit(1);
}

console.log(`skills-validate: OK (${PACKAGES.length} packages)`);
