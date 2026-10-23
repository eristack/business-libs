#!/usr/bin/env node
/**
 * Fail CI when publishable @eristack/* packages declare workspace:* in dependencies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

function listPublishablePackages() {
  const found = [];
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const slug of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, slug.name);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.private) continue;
      if (!String(pkgJson.name ?? "").startsWith("@eristack/")) continue;
      found.push({ name: pkgJson.name, pkgDir, pkgJson });
    }
  }
  return found;
}

/** @eristack/* peers must ship caret 0.x floors (not workspace:). */
const ERISTACK_PEER_RANGE = /^\^0\.\d+\.\d+/;

/** Audit D-003–D-005 — adapter packages must declare these @eristack peers. */
const REQUIRED_ERISTACK_PEERS = {
  "@eristack/jwt-auth": ["@eristack/data-grid"],
  "@eristack/data-grid": ["@eristack/timestamp"],
  "@eristack/doc-number": ["@eristack/data-grid", "@eristack/timestamp"],
};

const errors = [];
for (const pkg of listPublishablePackages()) {
  const deps = pkg.pkgJson.dependencies ?? {};
  for (const [dep, version] of Object.entries(deps)) {
    if (String(version).startsWith("workspace:")) {
      errors.push(
        `${pkg.name}: dependencies["${dep}"] = "${version}" — move to peerDependencies + devDependencies`,
      );
    }
  }

  const peerDeps = pkg.pkgJson.peerDependencies ?? {};
  const devDeps = pkg.pkgJson.devDependencies ?? {};
  for (const [peer, range] of Object.entries(peerDeps)) {
    if (!peer.startsWith("@eristack/")) continue;
    const rangeStr = String(range);
    if (rangeStr.startsWith("workspace:")) {
      errors.push(
        `${pkg.name}: peerDependencies["${peer}"] must be semver (got workspace:*)`,
      );
      continue;
    }
    if (!ERISTACK_PEER_RANGE.test(rangeStr)) {
      errors.push(
        `${pkg.name}: peerDependencies["${peer}"] = "${rangeStr}" — use ^0.minor.patch floor`,
      );
    }
    const optional = pkg.pkgJson.peerDependenciesMeta?.[peer]?.optional === true;
    const devVersion = devDeps[peer];
    if (
      !optional &&
      !String(devVersion ?? "").startsWith("workspace:")
    ) {
      errors.push(
        `${pkg.name}: devDependencies["${peer}"] must be workspace:* for monorepo tests`,
      );
    }
  }

  const required = REQUIRED_ERISTACK_PEERS[pkg.name] ?? [];
  for (const peer of required) {
    if (!(peer in peerDeps)) {
      errors.push(
        `${pkg.name}: missing required peerDependencies["${peer}"] (publish adapter map)`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("check-publish-deps: FAILED\n");
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log("check-publish-deps: OK");
