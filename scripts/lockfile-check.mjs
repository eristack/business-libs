#!/usr/bin/env node
/**
 * Fail when any workspace package.json differs from pnpm-lock.yaml (CI parity).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("pnpm", ["install", "--frozen-lockfile"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: { ...process.env, CI: process.env.CI ?? "true" },
});

if (result.status !== 0) {
  console.error(
    "\nLockfile out of date — run: pnpm lockfile:sync  (or pnpm eristack sync deps)\n",
  );
  process.exit(result.status ?? 1);
}

console.log("OK — pnpm-lock.yaml matches workspace package.json files");
