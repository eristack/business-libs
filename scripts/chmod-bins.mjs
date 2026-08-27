#!/usr/bin/env node
/**
 * Shared post-build chmod for CLI bins. Usage:
 *   node scripts/chmod-bins.mjs path/to/cli.js [more...]
 */
import fs from "node:fs";

for (const file of process.argv.slice(2)) {
  if (fs.existsSync(file)) {
    fs.chmodSync(file, 0o755);
  }
}
