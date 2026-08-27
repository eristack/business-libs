#!/usr/bin/env node
/**
 * Validate Intent skills for all @eristack packages (single source for skills:validate).
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const PACKAGES = [
  "packages/primitive/money",
  "packages/primitive/timestamp",
  "packages/capability/doc-number",
  "packages/capability/qups",
  "packages/capability/stock-movement",
  "packages/capability/financial-ledger",
  "packages/capability/valuations",
  "packages/service/data-grid",
  "packages/service/jwt-auth",
  "packages/service/epoch",
  "packages/service/rbac",
  "packages/service/abac",
  "packages/service/pbac",
  "packages/service/hash-chained-ledger",
  "packages/infrastructure/backseat",
  "packages/ui/multitab",
  "packages/ai/ai-knowledge",
  "packages/ai/ai-workflow",
  "packages/ai/ai-ticket-generator",
  "packages/ai/ai-dev",
];

for (const pkg of PACKAGES) {
  execSync(`pnpm exec intent validate ${pkg}`, {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

console.log(`skills-validate: OK (${PACKAGES.length} packages)`);
