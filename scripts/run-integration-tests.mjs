#!/usr/bin/env node
/**
 * Run vitest in packages that declare tests/drizzle.integration.test.ts.
 * Runs per-package; harness lives in internal/test-harness (@internal/test-harness).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

function packagesWithIntegrationTests() {
  const names = [];
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const slug of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, slug.name);
      const testFile = path.join(pkgDir, "tests", "drizzle.integration.test.ts");
      if (!fs.existsSync(testFile)) continue;
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.name) names.push(pkgJson.name);
    }
  }
  return names.sort();
}

const packages = packagesWithIntegrationTests();

if (packages.length === 0) {
  console.log("test:integration: no drizzle.integration.test.ts files found (OK)");
  process.exit(0);
}

console.log(`test:integration: ${packages.join(", ")}`);
for (const name of packages) {
  execSync(
    `pnpm --filter ${name} exec vitest run tests/drizzle.integration.test.ts`,
    { cwd: repoRoot, stdio: "inherit" },
  );
}

console.log("test:integration: OK");
