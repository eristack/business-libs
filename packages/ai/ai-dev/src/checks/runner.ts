import { execSync } from "node:child_process";
import type { CheckDef, CheckId, CheckProfile } from "./registry.js";
import { CHECK_DEFS, checksForProfile } from "./registry.js";

export type CheckRunResult = {
  id: CheckId;
  ok: boolean;
  ms: number;
  command: string;
  error?: string;
};

export type RunChecksOptions = {
  repoRoot: string;
  profile: CheckProfile;
  packages?: string[];
  only?: CheckId[];
  skipBuild?: boolean;
};

function turboFilterArg(packages: string[] | undefined): string[] {
  if (!packages?.length) return [];
  return packages.flatMap((name) => ["--filter", `${name}...`]);
}

function commandForCheck(
  def: CheckDef,
  packages?: string[],
): { argv: string[]; display: string } {
  const filter = def.turboFilter ? turboFilterArg(packages) : [];

  switch (def.id) {
    case "build":
      return {
        argv: ["pnpm", "exec", "turbo", "run", "build", ...filter],
        display: `turbo run build${filter.length ? " (filtered)" : ""}`,
      };
    case "typecheck":
      return {
        argv: ["pnpm", "exec", "turbo", "run", "typecheck", ...filter],
        display: `turbo run typecheck${filter.length ? " (filtered)" : ""}`,
      };
    case "test":
      return {
        argv: ["pnpm", "exec", "turbo", "run", "test", ...filter],
        display: `turbo run test${filter.length ? " (filtered)" : ""}`,
      };
    case "examples":
      return {
        argv: ["pnpm", "--filter", "./examples/*", "run", "typecheck"],
        display: "pnpm --filter './examples/*' run typecheck",
      };
    case "lint":
      return {
        argv: ["pnpm", "exec", "turbo", "run", "lint", ...filter],
        display: `turbo run lint${filter.length ? " (filtered)" : ""}`,
      };
    case "exports":
      return {
        argv: ["node", "scripts/check-package-exports.mjs"],
        display: "pnpm exports:check",
      };
    case "changesets":
      return {
        argv: ["node", "scripts/check-changesets.mjs"],
        display: "pnpm changesets:check",
      };
    case "publish":
      return {
        argv: ["node", "scripts/check-publish-deps.mjs"],
        display: "pnpm publish:check",
      };
    case "skills":
      return {
        argv: ["node", "scripts/skills-validate.mjs"],
        display: "pnpm skills:validate",
      };
    case "knowledge":
      return {
        argv: ["pnpm", "--filter", "@eristack/ai-knowledge", "sync:check"],
        display: "pnpm knowledge:check",
      };
    case "docs":
      return {
        argv: ["node", "scripts/docs-check.mjs"],
        display: "pnpm docs:check",
      };
    case "ticket":
      return {
        argv: ["pnpm", "--filter", "@eristack/ai-ticket-generator", "check"],
        display: "pnpm ticket:check",
      };
    case "contrast":
      return {
        argv: ["pnpm", "--filter", "@eristack/web", "contrast:check"],
        display: "pnpm --filter @eristack/web contrast:check",
      };
    default:
      throw new Error(`No command mapping for check ${def.id}`);
  }
}

function runOne(
  def: CheckDef,
  repoRoot: string,
  packages?: string[],
): CheckRunResult {
  const started = Date.now();
  const { argv, display } = commandForCheck(def, packages);
  try {
    execSync(argv.join(" "), {
      cwd: repoRoot,
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env, CI: process.env.CI ?? "true" },
    });
    return {
      id: def.id,
      ok: true,
      ms: Date.now() - started,
      command: display,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      id: def.id,
      ok: false,
      ms: Date.now() - started,
      command: display,
      error: message.slice(0, 400),
    };
  }
}

export function runChecks(options: RunChecksOptions): CheckRunResult[] {
  const { repoRoot, profile, packages, only } = options;
  let defs = checksForProfile(profile, { only });

  if (options.skipBuild) {
    defs = defs.filter((d) => d.id !== "build");
  }

  const results: CheckRunResult[] = [];
  let built = false;

  for (const def of defs) {
    if (def.needsBuild && !built && def.id !== "build") {
      const buildDef = CHECK_DEFS.find((d) => d.id === "build");
      if (buildDef && !results.some((r) => r.id === "build")) {
        results.push(runOne(buildDef, repoRoot, packages));
        built = true;
        if (!results.at(-1)?.ok) break;
      }
    }
    if (def.id === "build") built = true;
    results.push(runOne(def, repoRoot, packages));
    if (!results.at(-1)?.ok) break;
  }

  return results;
}

export function summarizeResults(results: CheckRunResult[]): {
  ok: boolean;
  passed: number;
  failed: number;
  totalMs: number;
} {
  const failed = results.filter((r) => !r.ok).length;
  return {
    ok: failed === 0,
    passed: results.length - failed,
    failed,
    totalMs: results.reduce((sum, r) => sum + r.ms, 0),
  };
}
