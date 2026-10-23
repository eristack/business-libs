#!/usr/bin/env node
/**
 * Stabilization gate (STAB-AI-1): cross-cutting @eristack/ai-knowledge skills
 * should list at most one `sources` entry (token budget).
 *
 * Usage: node scripts/check-skill-sources.mjs [--ci]
 * Exit 1 in --ci when violations exist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const skillsDir = path.join(
  repoRoot,
  "packages/ai/ai-knowledge/skills",
);
const ci = process.argv.includes("--ci");
const MAX_SOURCES = 1;

function countSources(skillPath) {
  const content = fs.readFileSync(skillPath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return 0;
  const block = match[1].match(/^sources:\r?\n((?:\s+-\s+.+\r?\n)+)/m);
  if (!block) return 0;
  return block[1].split(/\r?\n/).filter((line) => /^\s+-\s+/.test(line)).length;
}

function skillIdFromPath(skillPath) {
  return path.basename(path.dirname(skillPath));
}

const violations = [];

for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillPath = path.join(skillsDir, entry.name, "SKILL.md");
  if (!fs.existsSync(skillPath)) continue;
  const id = skillIdFromPath(skillPath);
  const count = countSources(skillPath);
  if (count <= MAX_SOURCES) continue;
  violations.push({ id, count, skillPath });
}

if (violations.length === 0) {
  console.log(
    `check-skill-sources: OK (ai-knowledge cross-cutting ≤${MAX_SOURCES} source)`,
  );
  process.exit(0);
}

console.error("check-skill-sources: violations (canonical skills need one source):");
for (const v of violations) {
  console.error(`  ${v.id}: ${v.count} sources (${path.relative(repoRoot, v.skillPath)})`);
}

if (ci) process.exit(1);
process.exit(0);
