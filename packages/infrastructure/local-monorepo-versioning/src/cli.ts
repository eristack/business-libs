#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { planRelease, type BumpRequest, type SemverLevel } from "./core/index.js";
import {
  DEFAULT_LOCK_FILENAME,
  applyLockToPackageJson,
  loadLock,
  saveLock,
  validateLockFile,
  writeManifest,
} from "./node/index.js";
import type { WorkspaceMember } from "./core/index.js";

function usage(): never {
  console.error(`Usage:
  eristack-version validate [--lock path] [--workspace path]
  eristack-version bump key:level [key:level ...] [--lock path] [--workspace path] [--dry-run]
  eristack-version apply [--lock path]
  eristack-version manifest [--lock path] [--out path]

Workspace file: JSON array of { "key", "path", "packageName?" }`);
  process.exit(1);
}

function readWorkspace(filePath: string): WorkspaceMember[] {
  return JSON.parse(readFileSync(filePath, "utf8")) as WorkspaceMember[];
}

function parseBumpToken(token: string): BumpRequest {
  const [key, level] = token.split(":");
  if (!key || !level) throw new Error(`Invalid bump token: ${token}`);
  if (level !== "patch" && level !== "minor" && level !== "major") {
    throw new Error(`Invalid level in ${token}`);
  }
  return { key, level: level as SemverLevel };
}

function flagValue(args: string[], name: string, fallback: string): string {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  if (!v) throw new Error(`Missing value for ${name}`);
  return v;
}

const args = process.argv.slice(2);
const cmd = args[0];
if (!cmd) usage();

const repoRoot = process.cwd();
const lockPath = path.resolve(
  repoRoot,
  flagValue(args, "--lock", DEFAULT_LOCK_FILENAME),
);
const dryRun = args.includes("--dry-run");

try {
  if (cmd === "validate") {
    const workspacePath = flagValue(args, "--workspace", "version.workspace.json");
    validateLockFile(lockPath, readWorkspace(path.resolve(repoRoot, workspacePath)));
    console.log("OK — version lock valid");
    process.exit(0);
  }

  if (cmd === "apply") {
    const lock = loadLock(lockPath);
    if (dryRun) {
      console.log(JSON.stringify(lock, null, 2));
      process.exit(0);
    }
    applyLockToPackageJson(repoRoot, lock);
    console.log("OK — applied lock to package.json files");
    process.exit(0);
  }

  if (cmd === "manifest") {
    const lock = loadLock(lockPath);
    const out = path.resolve(
      repoRoot,
      flagValue(args, "--out", "version.manifest.json"),
    );
    writeManifest(out, lock);
    console.log(`OK — wrote ${out}`);
    process.exit(0);
  }

  if (cmd === "bump") {
    const workspacePath = flagValue(args, "--workspace", "version.workspace.json");
    const workspace = readWorkspace(path.resolve(repoRoot, workspacePath));
    const bumpArgs: string[] = [];
    for (let i = 1; i < args.length; i++) {
      const a = args[i];
      if (!a) continue;
      if (a.startsWith("--")) {
        if (a === "--lock" || a === "--workspace" || a === "--out") i++;
        continue;
      }
      if (a.includes(":")) bumpArgs.push(a);
    }
    if (!bumpArgs.length) usage();
    const requests = bumpArgs.map(parseBumpToken);
    const lock = loadLock(lockPath);
    const { nextLock, release } = planRelease(lock, requests);
    if (dryRun) {
      console.log(JSON.stringify({ release, nextLock }, null, 2));
      process.exit(0);
    }
    saveLock(lockPath, nextLock);
    applyLockToPackageJson(repoRoot, nextLock);
    validateLockFile(lockPath, workspace);
    console.log(`OK — release ${release.id} · root ${release.root.from} → ${release.root.to}`);
    process.exit(0);
  }

  usage();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
