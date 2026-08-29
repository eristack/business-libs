#!/usr/bin/env node
/**
 * AD6 — layer-06 `packages/features/` must stay empty (README only) until promoted.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

const featuresDir = join(process.cwd(), "packages/features");
const allowed = new Set(["README.md"]);
const entries = readdirSync(featuresDir);
const unexpected = entries.filter((name) => !allowed.has(name));

if (unexpected.length > 0) {
  console.error(
    `packages/features must contain only README.md until layer-06 ships. Found: ${unexpected.join(", ")}`,
  );
  process.exit(1);
}

console.log("OK — packages/features is layer-06 placeholder only");
