#!/usr/bin/env node
/**
 * Refresh pnpm-lock.yaml after package.json dependency edits (no node_modules churn).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("pnpm", ["install", "--lockfile-only"], {
  cwd: repoRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
