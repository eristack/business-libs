import {
  compactJson,
  findRepoRoot,
  listEristackPackages,
  planFromGit,
  planFromPaths,
  resolveProfile,
  runChecks,
  runCi,
  runSync,
  summarizeResults,
  type CheckId,
  type SyncTarget,
} from "./index.js";

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function flagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx < 0) return undefined;
  return args[idx + 1];
}

function printHelp(): void {
  console.log(`eristack — unified Eristack monorepo dev tooling (agent-first)

Commands:
  plan [--base main] [--json] [paths...]
      Minimal check/sync/skill plan from git diff or explicit paths.
  check [--profile catalog|pr|full|fast|integration|examples|publish|features] [--skip-build] [--json] [check-id...]
      Run a check profile (same as CI when --profile pr).
  ci [--base origin/main] [--full] [--json]
      PR-optimized CI: affected turbo + drift checks; full on main or --full.
  sync <docs|knowledge|all> [--check] [--json]
      Sync or verify docs/knowledge catalogs.
  packages list [--json] [--docs] [--skills] [--ticket]
      List @eristack/* packages (canonical walker).

Profiles:
  catalog      Drift checks only (docs, knowledge, skills, ticket, exports*)
  pr           CI gate: build + typecheck + test + integration + catalog
  full         pr + lint
  fast         Turbo filter on changed packages (from plan)
  integration  drizzle.integration.test.ts only (pnpm test:integration)
  examples     example apps build (pnpm --filter './examples/*' build)
  publish      publish dependency hygiene only (pnpm publish:check)

  * exports needs build — runner auto-builds when required.

MCP:  eristack-mcp  (dev_plan, dev_check, dev_packages)

Examples:
  pnpm eristack plan --json
  pnpm eristack check --profile pr
  pnpm eristack ci --base origin/main
  pnpm eristack sync knowledge
  pnpm eristack sync docs --check
`);
}

async function cmdPlan(args: string[], repoRoot: string): Promise<void> {
  const json = hasFlag(args, "--json");
  const base = flagValue(args, "--base") ?? "main";
  const paths = args.filter((a) => !a.startsWith("--") && a !== base);

  const plan =
    paths.length > 0
      ? planFromPaths(repoRoot, paths)
      : planFromGit(repoRoot, base);

  if (json) {
    console.log(compactJson(plan));
    return;
  }

  console.log(`profile: ${plan.profile}`);
  if (plan.packages.length) console.log(`packages: ${plan.packages.join(", ")}`);
  if (plan.checks.length) console.log(`checks: ${plan.checks.join(", ")}`);
  if (plan.sync.length) console.log(`sync: ${plan.sync.join(", ")}`);
  if (plan.skills.length) console.log(`skills: ${plan.skills.join(", ")}`);
  console.log("commands:");
  for (const cmd of plan.commands) console.log(`  ${cmd}`);
  if (plan.note) console.log(`note: ${plan.note}`);
}

async function cmdCheck(args: string[], repoRoot: string): Promise<void> {
  const json = hasFlag(args, "--json");
  const profileArg = flagValue(args, "--profile");
  const profile = resolveProfile(profileArg ?? "pr");
  const only = args.filter(
    (a) => !a.startsWith("--") && a !== profileArg,
  ) as CheckId[];
  const skipBuild = hasFlag(args, "--skip-build");

  let packages: string[] | undefined;
  if (profile === "fast") {
    const plan = planFromGit(repoRoot);
    packages = plan.packages.length ? plan.packages : undefined;
  }

  const results = runChecks({
    repoRoot,
    profile,
    packages,
    only: only.length ? only : undefined,
    skipBuild,
  });
  const summary = summarizeResults(results);

  if (json) {
    console.log(compactJson({ ...summary, results }));
    process.exitCode = summary.ok ? 0 : 1;
    return;
  }

  for (const r of results) {
    const mark = r.ok ? "✓" : "✗";
    console.log(`${mark} ${r.id} (${r.ms}ms) — ${r.command}`);
    if (r.error) {
      console.error(r.error);
    }
  }
  console.log(
    summary.ok
      ? `\nOK — ${summary.passed} checks (${summary.totalMs}ms)`
      : `\nFAILED — ${summary.failed} check(s)`,
  );
  process.exitCode = summary.ok ? 0 : 1;
}

async function cmdCi(args: string[], repoRoot: string): Promise<void> {
  const json = hasFlag(args, "--json");
  const base = flagValue(args, "--base") ?? "origin/main";
  const forceFull =
    hasFlag(args, "--full") || process.env.CI_FULL === "true";

  const { plan, results, summary } = runCi({
    repoRoot,
    base,
    forceFull,
  });

  if (json) {
    console.log(compactJson({ plan, ...summary, results }));
    process.exitCode = summary.ok ? 0 : 1;
    return;
  }

  console.log(`ci mode: ${plan.mode}${forceFull ? " (forced full)" : ""}`);
  if (plan.packages.length) {
    console.log(`packages: ${plan.packages.join(", ")}`);
  }
  if (plan.driftChecks.length) {
    console.log(`drift: ${plan.driftChecks.join(", ")}`);
  }
  if (!plan.webBuild && plan.mode === "affected") {
    console.log("web: typecheck only (next build skipped)");
  }

  for (const r of results) {
    const mark = r.ok ? "✓" : "✗";
    console.log(`${mark} ${r.id} (${r.ms}ms) — ${r.command}`);
    if (r.error) {
      console.error(r.error);
    }
  }
  console.log(
    summary.ok
      ? `\nOK — ${summary.passed} steps (${summary.totalMs}ms)`
      : `\nFAILED — ${summary.failed} step(s)`,
  );
  process.exitCode = summary.ok ? 0 : 1;
}

async function cmdSync(args: string[], repoRoot: string): Promise<void> {
  const json = hasFlag(args, "--json");
  const check = hasFlag(args, "--check");
  const target = args.find((a) => !a.startsWith("--")) as
    | SyncTarget
    | undefined;

  if (!target || !["docs", "knowledge", "all"].includes(target)) {
    console.error("Usage: eristack sync <docs|knowledge|all> [--check]");
    process.exitCode = 1;
    return;
  }

  const result = runSync(repoRoot, target, check);
  if (json) {
    console.log(compactJson(result));
  } else if (result.ok) {
    console.log(check ? `OK — ${target} in sync` : `Synced ${target}`);
    if (result.output) console.log(result.output);
  } else {
    console.error(result.output);
  }
  process.exitCode = result.ok ? 0 : 1;
}

async function cmdPackages(args: string[], repoRoot: string): Promise<void> {
  const json = hasFlag(args, "--json");
  const pkgs = listEristackPackages(repoRoot, {
    hasDocs: hasFlag(args, "--docs") || undefined,
    hasSkills: hasFlag(args, "--skills") || undefined,
    hasTicket: hasFlag(args, "--ticket") || undefined,
  });

  if (json) {
    console.log(
      compactJson(
        pkgs.map((p) => ({
          n: p.name,
          slug: p.slug,
          cat: p.category,
          v: p.version,
          docs: p.hasDocs,
          skills: p.hasSkills,
          ticket: p.hasTicket,
        })),
      ),
    );
    return;
  }

  for (const p of pkgs) {
    console.log(`${p.name}@${p.version ?? "?"}  ${p.relDir}`);
  }
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  const repoRoot = findRepoRoot(process.cwd());

  switch (cmd) {
    case "plan":
      await cmdPlan(rest, repoRoot);
      return;
    case "check":
      await cmdCheck(rest, repoRoot);
      return;
    case "ci":
      await cmdCi(rest, repoRoot);
      return;
    case "sync":
      await cmdSync(rest, repoRoot);
      return;
    case "packages":
      if (rest[0] === "list") {
        await cmdPackages(rest.slice(1), repoRoot);
        return;
      }
      console.error("Usage: eristack packages list [--json]");
      process.exitCode = 1;
      return;
    case "help":
    case undefined:
      printHelp();
      return;
    default:
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
