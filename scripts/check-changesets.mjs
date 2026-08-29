#!/usr/bin/env node
/**
 * Guard pending Changesets before merge:
 * 1. One package per .changeset file (avoids duplicated mega-changelog in Version PR).
 * 2. No minor/major on packages already past 0.0.0 — on 0.1.x, minor semver
 *    becomes 0.2.0 and breaks peer ranges like ^0.1.0 (npm: <0.2.0), cascading
 *    major bumps to all peer dependents via Changesets.
 * 3. No cross-package ### headings in the body (mega-changelog smell).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const changesetDir = path.join(repoRoot, ".changeset");
const packagesDir = path.join(repoRoot, "packages");

const CROSS_PKG_HEADING_RE = /^###\s+@eristack\//gm;

/** @returns {Map<string, string>} package name → semver */
function packageVersions() {
  /** @type {Map<string, string>} */
  const map = new Map();
  if (!fs.existsSync(packagesDir)) return map;

  for (const category of fs.readdirSync(packagesDir)) {
    const categoryDir = path.join(packagesDir, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    for (const slug of fs.readdirSync(categoryDir)) {
      const pkgDir = path.join(categoryDir, slug);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkg.name && pkg.version) map.set(pkg.name, pkg.version);
    }
  }
  return map;
}

/** @returns {Map<string, Array<{ consumer: string, range: string }>>} */
function peerConsumersByPackage() {
  /** @type {Map<string, Array<{ consumer: string, range: string }>>} */
  const map = new Map();
  if (!fs.existsSync(packagesDir)) return map;

  for (const category of fs.readdirSync(packagesDir)) {
    const categoryDir = path.join(packagesDir, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    for (const slug of fs.readdirSync(categoryDir)) {
      const pkgJsonPath = path.join(categoryDir, slug, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (!pkg.name?.startsWith("@eristack/") || pkg.private) continue;
      for (const [peer, range] of Object.entries(pkg.peerDependencies ?? {})) {
        if (!peer.startsWith("@eristack/")) continue;
        const list = map.get(peer) ?? [];
        list.push({ consumer: pkg.name, range: String(range) });
        map.set(peer, list);
      }
    }
  }
  return map;
}

/** @param {string} version */
function minorSemverOnZeroLine(version) {
  const m = /^0\.(\d+)\./.exec(version);
  if (!m) return null;
  return `0.${Number(m[1]) + 1}.0`;
}

/** @param {string} version */
function isPastInitialPublish(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) return true;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const patch = Number(m[3]);
  if (major > 0) return true;
  if (minor > 0) return true;
  return patch > 0;
}

/**
 * @param {string} filePath
 * @returns {{ packages: Map<string, string>, body: string } | null}
 */
function parseChangeset(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) return null;

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return null;

  const frontmatter = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();

  /** @type {Map<string, string>} */
  const packages = new Map();
  for (const line of frontmatter.split("\n")) {
    const match = /^"(@eristack\/[^"]+)":\s*(patch|minor|major)\s*$/.exec(
      line.trim(),
    );
    if (match) packages.set(match[1], match[2]);
  }

  if (packages.size === 0) return null;
  return { packages, body };
}

function main() {
  if (!fs.existsSync(changesetDir)) {
    console.log("check-changesets: no .changeset/ directory — skip");
    return;
  }

  const versions = packageVersions();
  const peerConsumers = peerConsumersByPackage();
  /** @type {string[]} */
  const errors = [];

  const files = fs
    .readdirSync(changesetDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  if (files.length === 0) {
    console.log("check-changesets: no pending changesets");
    return;
  }

  for (const file of files) {
    const filePath = path.join(changesetDir, file);
    const parsed = parseChangeset(filePath);
    if (!parsed) continue;

    const { packages, body } = parsed;

    if (packages.size > 1) {
      errors.push(
        `${file}: lists ${packages.size} packages — use one .changeset file per package so Version PR changelogs stay unique`,
      );
    }

    const crossHeadings = body.match(CROSS_PKG_HEADING_RE) ?? [];
    if (crossHeadings.length > 0) {
      errors.push(
        `${file}: body uses cross-package headings (${crossHeadings.length}× \`### @eristack/...\`) — describe only this package's changes`,
      );
    }

    const bodyLines = body.split("\n").filter((line) => line.trim().length > 0);
    if (bodyLines.length > 80) {
      console.warn(
        `check-changesets: warn — ${file} body has ${bodyLines.length} non-empty lines (recommended ≤80)`,
      );
    }

    for (const [pkgName, bump] of packages) {
      if (bump === "patch") continue;

      const current = versions.get(pkgName);
      if (!current) {
        errors.push(`${file}: unknown package ${pkgName}`);
        continue;
      }

      if (isPastInitialPublish(current)) {
        const peers = peerConsumers.get(pkgName) ?? [];
        const nextMinor = bump === "minor" ? minorSemverOnZeroLine(current) : null;
        let detail =
          bump === "minor"
            ? `minor on ${current} → semver ${nextMinor ?? "?"} (repo policy: exit 0.x or intentional 1.0.0)`
            : "a major bump";

        if (bump === "minor" && nextMinor && peers.length > 0) {
          const capped = peers.slice(0, 4).map((p) => `${p.consumer} (${p.range})`);
          const extra = peers.length > 4 ? ` +${peers.length - 4} more` : "";
          detail += ` — breaks ${peers.length} peer range(s) (${capped.join(", ")}${extra}); Changesets will major-bump those dependents`;
        }

        errors.push(
          `${file}: "${pkgName}": ${bump} on ${current} would ship ${detail} — use patch for routine 0.1.x features (see dev-conventions § Changesets on 0.x)`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("check-changesets: failed\n");
    for (const err of errors) console.error(`  • ${err}`);
    console.error(
      "\nAuthoring: patch on 0.1.x stays inside ^0.1.0 peers (<0.2.0). To ship 0.2.0+, coordinate peer range bumps in the same release train.",
    );
    process.exit(1);
  }

  console.log(`check-changesets: OK (${files.length} pending file(s))`);
}

main();
