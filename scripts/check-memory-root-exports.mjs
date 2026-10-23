#!/usr/bin/env node
/**
 * STAB-MEM-1: block NEW createMemory* exports from package root (src/index.ts).
 * Known debt packages are allowlisted until STAB-MEM-2+ moves them to /testing.
 *
 * Usage: node scripts/check-memory-root-exports.mjs [--ci]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listEristackPackages } from "./lib/list-eristack-packages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const ci = process.argv.includes("--ci");

/** @type {Record<string, string[]>} package name → allowed createMemory export names */
const ALLOWLIST = {
  "@eristack/backseat": ["createMemoryBackseatStore"],
  "@eristack/comms": ["createMemoryCommsStore", "createMemoryCommsDriver"],
  "@eristack/doc-number": ["createMemoryFormatStore", "createMemorySequenceStore"],
  "@eristack/epoch": ["createMemoryEpochStore"],
  "@eristack/file-manager": [
    "createMemoryStorageDriver",
    "memoryPutViaPresignedUrl",
    "createMemoryFileRecordStore",
  ],
  "@eristack/jwt-auth": [
    "createMemoryRefreshTokenStore",
    "createMemoryCredentialStore",
  ],
  "@eristack/oauth": ["createMemoryOAuthPendingStore"],
  "@eristack/payment-manager": [
    "createMemoryPaymentDriver",
    "createMemoryPaymentManagerStore",
  ],
  "@eristack/qups": [
    "createMemoryPricingProfileStore",
    "createMemoryPricingLineStore",
  ],
  "@eristack/rbac": ["createMemoryRbacStore"],
};

function memoryExportsFromIndex(indexPath) {
  const text = fs.readFileSync(indexPath, "utf8");
  const names = new Set();
  for (const line of text.split(/\r?\n/)) {
    if (!line.includes("createMemory") && !line.includes("memoryPutViaPresignedUrl"))
      continue;
    const named = line.match(
      /export\s*\{([^}]+)\}/,
    );
    if (!named) continue;
    for (const part of named[1].split(",")) {
      const id = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (
        id &&
        (id.startsWith("createMemory") || id === "memoryPutViaPresignedUrl")
      ) {
        names.add(id);
      }
    }
  }
  return [...names].sort();
}

const packages = listEristackPackages(repoRoot);
const errors = [];

for (const pkg of packages) {
  const indexPath = path.join(repoRoot, pkg.relDir, "src/index.ts");
  if (!fs.existsSync(indexPath)) continue;
  const found = memoryExportsFromIndex(indexPath);
  if (found.length === 0) continue;

  const allowed = ALLOWLIST[pkg.name];
  if (!allowed) {
    errors.push(
      `${pkg.name}: root exports ${found.join(", ")} — not allowlisted (use /testing)`,
    );
    continue;
  }
  const allowedSet = new Set(allowed);
  for (const sym of found) {
    if (!allowedSet.has(sym)) {
      errors.push(
        `${pkg.name}: unexpected root export ${sym} (allowed: ${allowed.join(", ")})`,
      );
    }
  }
  for (const sym of allowed) {
    if (!found.includes(sym)) {
      errors.push(
        `${pkg.name}: allowlist stale — missing ${sym} on root (update script or move export)`,
      );
    }
  }
}

if (errors.length === 0) {
  console.log(
    `check-memory-root-exports: OK (${Object.keys(ALLOWLIST).length} allowlisted debt packages)`,
  );
  process.exit(0);
}

console.error("check-memory-root-exports: failed");
for (const e of errors) console.error(`  • ${e}`);
process.exit(ci ? 1 : 0);
