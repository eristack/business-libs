import { execSync } from "node:child_process";
import type { CheckId } from "../checks/registry.js";
import { runChecks, summarizeResults, type CheckRunResult } from "../checks/runner.js";
import {
  gitChangedFiles,
  planFromPaths,
  type DevPlan,
} from "../plan/from-paths.js";

/** Any match forces full `pr` profile (same as pre-optimization CI). */
const FULL_CI_PATTERNS: RegExp[] = [
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^turbo\.json$/,
  /^package\.json$/,
  /^\.github\//,
  /^packages\/ai\/ai-dev\//,
  /^scripts\/check-/,
  /^scripts\/docs-/,
  /^scripts\/eristack-run\.mjs$/,
  /^scripts\/run-integration-tests\.mjs$/,
  /^scripts\/doc-meta-lib\.mjs$/,
  /^scripts\/doc-packages\.mjs$/,
];

const CATALOG_ONLY_PATTERNS: RegExp[] = [
  /^\.changeset\//,
  /^packages\/[^/]+\/[^/]+\/docs\//,
  /^packages\/[^/]+\/[^/]+\/skills\//,
  /^packages\/ai\/ai-knowledge\//,
  /^packages\/[^/]+\/[^/]+\/ticket\.yaml$/,
  /^roadmap\//,
  /^_ai-docs\//,
  /^AGENTS\.md$/,
  /^README\.md$/,
];

const WEB_APP_PREFIX = "apps/web/";
const EXAMPLES_PREFIX = "examples/";

export type CiMode = "full" | "affected" | "catalog";

export type CiPlan = DevPlan & {
  mode: CiMode;
  /** Run `next build` for @eristack/web (skipped on library-only PRs). */
  webBuild: boolean;
  /** Git ref for turbo `--filter=...[ref]` (e.g. origin/main). */
  turboBase: string;
  /** Extra catalog/drift checks after affected turbo (exports added when needed). */
  driftChecks: CheckId[];
};

function normalized(paths: string[]): string[] {
  return paths.map((p) => p.replace(/\\/g, "/"));
}

export function requiresFullCi(changed: string[]): boolean {
  const paths = normalized(changed);
  return paths.some((rel) =>
    FULL_CI_PATTERNS.some((pattern) => pattern.test(rel)),
  );
}

export function webAppChanged(changed: string[]): boolean {
  return normalized(changed).some((rel) => rel.startsWith(WEB_APP_PREFIX));
}

export function examplesChanged(changed: string[]): boolean {
  return normalized(changed).some((rel) => rel.startsWith(EXAMPLES_PREFIX));
}

export function packageJsonChanged(changed: string[]): boolean {
  return normalized(changed).some(
    (rel) =>
      /\/package\.json$/.test(rel) && rel.startsWith("packages/"),
  );
}

export function hasSourceChanges(changed: string[]): boolean {
  return normalized(changed).some(
    (rel) =>
      /\/src\//.test(rel) ||
      /\/tests?\//.test(rel) ||
      rel.endsWith(".test.ts"),
  );
}

function isCatalogOnlyChange(changed: string[]): boolean {
  const paths = normalized(changed);
  if (paths.length === 0) return false;
  const hasNonCatalog = paths.some(
    (rel) => !CATALOG_ONLY_PATTERNS.some((pattern) => pattern.test(rel)),
  );
  return !hasNonCatalog;
}

function driftChecksForCatalogOnly(changed: string[]): CheckId[] {
  const paths = normalized(changed);
  const checks = new Set<CheckId>();

  for (const rel of paths) {
    if (rel.startsWith(".changeset/")) checks.add("changesets");
    if (rel.includes("/skills/")) checks.add("skills");
    if (rel.startsWith("packages/ai/ai-knowledge/")) checks.add("knowledge");
    if (rel.includes("/docs/")) checks.add("docs");
    if (rel.endsWith("ticket.yaml")) checks.add("ticket");
    if (rel.startsWith(WEB_APP_PREFIX)) checks.add("contrast");
    if (rel.endsWith("package.json") && rel.startsWith("packages/")) {
      checks.add("exports");
    }
  }

  if (checks.size === 0) {
    return [
      "changesets",
      "skills",
      "knowledge",
      "docs",
      "ticket",
    ] satisfies CheckId[];
  }

  return [...checks];
}

function driftChecksForAffected(changed: string[]): CheckId[] {
  const checks: CheckId[] = [
    "changesets",
    "publish",
    "skills",
    "knowledge",
    "docs",
    "ticket",
  ];

  if (webAppChanged(changed)) checks.push("contrast");
  if (
    packageJsonChanged(changed) ||
    normalized(changed).some((rel) => rel.startsWith("scripts/"))
  ) {
    checks.push("exports");
  }
  if (examplesChanged(changed) || hasSourceChanges(changed)) {
    checks.push("examples");
  }

  return checks;
}

export function resolveCiPlanFromChanged(
  repoRoot: string,
  changed: string[],
  base = "origin/main",
  opts?: { forceFull?: boolean },
): CiPlan {
  const plan = planFromPaths(repoRoot, changed);

  if (opts?.forceFull || requiresFullCi(changed)) {
    return {
      ...plan,
      mode: "full",
      webBuild: true,
      turboBase: base,
      driftChecks: [],
      profile: "pr",
    };
  }

  if (isCatalogOnlyChange(changed)) {
    return {
      ...plan,
      mode: "catalog",
      webBuild: false,
      turboBase: base,
      driftChecks: driftChecksForCatalogOnly(changed),
      profile: "catalog",
    };
  }

  return {
    ...plan,
    mode: "affected",
    webBuild: webAppChanged(changed),
    turboBase: base,
    driftChecks: driftChecksForAffected(changed),
    profile: "fast",
  };
}

export function resolveCiPlan(
  repoRoot: string,
  base = "origin/main",
  opts?: { forceFull?: boolean },
): CiPlan {
  const changed = gitChangedFiles(repoRoot, base);
  return resolveCiPlanFromChanged(repoRoot, changed, base, opts);
}

function runCommand(
  repoRoot: string,
  argv: string[],
  display: string,
  id: CheckId = "build",
): CheckRunResult {
  const started = Date.now();
  try {
    execSync(argv.join(" "), {
      cwd: repoRoot,
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env, CI: process.env.CI ?? "true" },
    });
    return { id, ok: true, ms: Date.now() - started, command: display };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      id,
      ok: false,
      ms: Date.now() - started,
      command: display,
      error: message.slice(0, 400),
    };
  }
}

function turboAffected(
  repoRoot: string,
  base: string,
  tasks: string[],
  excludeWebBuild: boolean,
): CheckRunResult {
  const filter = `--filter=...[${base}]`;
  const exclude = excludeWebBuild ? " --filter=!@eristack/web" : "";
  const display = `turbo run ${tasks.join(" ")} ${filter}${exclude}`;
  return runCommand(
    repoRoot,
    ["pnpm", "exec", "turbo", "run", ...tasks, filter, ...(excludeWebBuild ? ["--filter=!@eristack/web"] : [])],
    display,
  );
}

export type RunCiOptions = {
  repoRoot: string;
  base?: string;
  forceFull?: boolean;
};

export type RunCiResult = {
  plan: CiPlan;
  results: CheckRunResult[];
  summary: ReturnType<typeof summarizeResults>;
};

export function runCi(options: RunCiOptions): RunCiResult {
  const { repoRoot, base = "origin/main", forceFull } = options;
  const plan = resolveCiPlan(repoRoot, base, { forceFull });
  const results: CheckRunResult[] = [];

  if (plan.mode === "full") {
    results.push(
      ...runChecks({ repoRoot, profile: "pr", skipBuild: false }),
    );
    return { plan, results, summary: summarizeResults(results) };
  }

  if (plan.mode === "catalog") {
    if (plan.driftChecks.includes("exports")) {
      results.push(
        runCommand(
          repoRoot,
          ["pnpm", "exec", "turbo", "run", "build", "--filter=!@eristack/web"],
          "turbo run build --filter=!@eristack/web (exports prep)",
          "build",
        ),
      );
      if (!results.at(-1)?.ok) {
        return { plan, results, summary: summarizeResults(results) };
      }
    }

    results.push(
      ...runChecks({
        repoRoot,
        profile: "catalog",
        only: plan.driftChecks,
        skipBuild: true,
      }),
    );
    return { plan, results, summary: summarizeResults(results) };
  }

  // affected
  results.push(
    turboAffected(repoRoot, plan.turboBase, ["build", "typecheck", "test"], true),
  );
  if (!results.at(-1)?.ok) {
    return { plan, results, summary: summarizeResults(results) };
  }

  results.push(
    runCommand(
      repoRoot,
      ["pnpm", "--filter", "@eristack/web", "run", "typecheck"],
      "pnpm --filter @eristack/web typecheck",
    ),
  );
  if (!results.at(-1)?.ok) {
    return { plan, results, summary: summarizeResults(results) };
  }

  if (plan.webBuild) {
    results.push(
      runCommand(
        repoRoot,
        ["pnpm", "--filter", "@eristack/web", "run", "build"],
        "pnpm --filter @eristack/web build",
      ),
    );
    if (!results.at(-1)?.ok) {
      return { plan, results, summary: summarizeResults(results) };
    }
  }

  if (plan.driftChecks.includes("exports")) {
    results.push(
      runCommand(
        repoRoot,
        ["pnpm", "exec", "turbo", "run", "build", "--filter=!@eristack/web"],
        "turbo run build --filter=!@eristack/web (exports prep)",
      ),
    );
    if (!results.at(-1)?.ok) {
      return { plan, results, summary: summarizeResults(results) };
    }
  }

  if (plan.driftChecks.length) {
    results.push(
      ...runChecks({
        repoRoot,
        profile: "catalog",
        only: plan.driftChecks,
        skipBuild: true,
      }),
    );
  }

  return { plan, results, summary: summarizeResults(results) };
}
