#!/usr/bin/env node
/**
 * Run eristack CLI without relying on PATH bin (works before pnpm link).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(__dirname, "../packages/ai/ai-dev/dist/cli.js");

const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});

process.exitCode = result.status ?? 1;
