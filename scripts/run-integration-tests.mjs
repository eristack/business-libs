#!/usr/bin/env node
/**
 * Run vitest in packages that declare tests/drizzle.integration.test.ts.
 * Runs per-package; harness lives in internal/test-harness (@internal/test-harness).
 *
 * --verify-covered: do not run the suites; assert each one is picked up by the
 * package's own `vitest run` (turbo `test`), so CI runs it exactly once and cached.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");
const TEST_REL = "tests/drizzle.integration.test.ts";
const VITEST_CONFIGS = [
  "vitest.config.ts",
  "vitest.config.mts",
  "vitest.config.js",
  "vitest.config.mjs",
];

function packagesWithIntegrationTests() {
  const found = [];
  for (const category of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, category.name);
    for (const slug of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const pkgDir = path.join(categoryDir, slug.name);
      if (!fs.existsSync(path.join(pkgDir, TEST_REL))) continue;
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      if (pkgJson.name) found.push({ name: pkgJson.name, pkgDir, pkgJson });
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

function globToRegExp(glob) {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (ch === "*") out += "[^/]*";
    else if (ch === "{") {
      const end = glob.indexOf("}", i);
      out += `(?:${glob.slice(i + 1, end).split(",").join("|")})`;
      i = end;
    } else out += ch.replace(/[.+?^$()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`);
}

function stringArray(source, key) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`));
  if (!match) return null;
  return [...match[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
}

/** Returns a reason string when turbo `test` would not run the integration suite. */
function coverageProblem({ pkgDir, pkgJson }) {
  const testScript = pkgJson.scripts?.test ?? "";
  if (!/\bvitest\b/.test(testScript) || /\bwatch\b/.test(testScript)) {
    return `scripts.test must run vitest once (got "${testScript}")`;
  }
  const configFile = VITEST_CONFIGS.find((f) =>
    fs.existsSync(path.join(pkgDir, f)),
  );
  if (!configFile) return null;
  const source = fs.readFileSync(path.join(pkgDir, configFile), "utf8");
  const include = stringArray(source, "include");
  if (include && !include.some((g) => globToRegExp(g).test(TEST_REL))) {
    return `${configFile} include ${JSON.stringify(include)} misses ${TEST_REL}`;
  }
  const exclude = stringArray(source, "exclude") ?? [];
  const excluded = exclude.find((g) => globToRegExp(g).test(TEST_REL));
  if (excluded) return `${configFile} exclude "${excluded}" drops ${TEST_REL}`;
  return null;
}

const packages = packagesWithIntegrationTests();

if (packages.length === 0) {
  console.log("test:integration: no drizzle.integration.test.ts files found (OK)");
  process.exit(0);
}

if (process.argv.includes("--verify-covered")) {
  const problems = packages
    .map((pkg) => [pkg.name, coverageProblem(pkg)])
    .filter(([, problem]) => problem);
  if (problems.length) {
    for (const [name, problem] of problems) console.error(`✗ ${name}: ${problem}`);
    console.error(
      "\nIntegration suites must run inside turbo `test` (CI no longer runs them a second time).",
    );
    process.exit(1);
  }
  console.log(
    `test:integration: ${packages.length} suites covered by turbo test (OK)`,
  );
  process.exit(0);
}

console.log(`test:integration: ${packages.map((p) => p.name).join(", ")}`);
for (const { name } of packages) {
  execSync(`pnpm --filter ${name} exec vitest run ${TEST_REL}`, {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

console.log("test:integration: OK");
