#!/usr/bin/env node
/**
 * Validate Intent skills for all @eristack packages (single source for skills:validate).
 * Also warns when a skill lists more than 3 sources unless ticket.yaml sets allowFatSkills: true.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listEristackPackages } from "./lib/list-eristack-packages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const MAX_SOURCES = 3;

/** Every publishable @eristack package that ships skills/ — auto-discovered, never hand-listed. */
const PACKAGES = listEristackPackages(repoRoot, { hasSkills: true }).map(
  (pkg) => pkg.relDir,
);

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

/**
 * One root `intent validate` covers every skill wired in root package.json
 * `intent.skills` (~1s) — per-package spawns cost ~10s for the same result.
 * Then assert it saw every skill file we discovered on disk, so a package
 * missing from `intent.skills` / root devDependencies fails here, not in CI.
 */
const expectedSkillFiles = PACKAGES.flatMap((pkg) =>
  findSkillFiles(path.join(repoRoot, pkg)),
).length;

let validateOutput = "";
try {
  validateOutput = execSync("pnpm exec intent validate", {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
} catch (error) {
  process.stderr.write(String(error.stdout ?? "") + String(error.stderr ?? ""));
  process.exit(error.status ?? 1);
}

const validatedMatch = validateOutput.match(/Validated (\d+) skill files/);
const validated = validatedMatch ? Number(validatedMatch[1]) : NaN;
if (!Number.isFinite(validated) || validated < expectedSkillFiles) {
  console.error(validateOutput);
  console.error(
    `\nskills-validate: intent validated ${validated} skill files but ${expectedSkillFiles} exist under packages/*/*/skills.\n` +
      "A package is missing from root package.json intent.skills (workspace:@eristack/<name>) or root devDependencies.\n",
  );
  process.exit(1);
}

for (const pkg of PACKAGES) {
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

console.log(
  `skills-validate: OK (${validated} skill files across ${PACKAGES.length} packages)`,
);
