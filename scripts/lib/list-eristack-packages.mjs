/**
 * Re-export for root .mjs scripts — source of truth: @eristack/ai-dev/src/repo/packages.ts
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { listEristackPackages, packagesFromPaths } = require("@eristack/ai-dev/repo");

export { listEristackPackages, packagesFromPaths };
