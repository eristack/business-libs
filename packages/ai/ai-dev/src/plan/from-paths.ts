import { execSync } from "node:child_process";
import type { CheckId, CheckProfile } from "../checks/registry.js";
import { checksForProfile } from "../checks/registry.js";
import { packagesFromPaths } from "../repo/packages.js";
import { nextBrainstormItem } from "./backlog-hint.js";

/** Primary Intent skill to load when a package changes (token saver). */
const PACKAGE_SKILL: Record<string, string> = {
  "@eristack/money": "@eristack/money#money-amounts",
  "@eristack/timestamp": "@eristack/timestamp#timestamp-core",
  "@eristack/doc-number": "@eristack/doc-number#doc-number-core",
  "@eristack/qups": "@eristack/qups#qups-core",
  "@eristack/stock-movement": "@eristack/stock-movement#stock-movement-core",
  "@eristack/financial-ledger":
    "@eristack/financial-ledger#financial-ledger-core",
  "@eristack/valuations": "@eristack/valuations#valuations-core",
  "@eristack/data-grid": "@eristack/data-grid#data-grid-core",
  "@eristack/jwt-auth": "@eristack/jwt-auth#jwt-auth-core",
  "@eristack/epoch": "@eristack/epoch#epoch-core",
  "@eristack/rbac": "@eristack/rbac#rbac-core",
  "@eristack/abac": "@eristack/abac#abac-core",
  "@eristack/pbac": "@eristack/pbac#pbac-core",
  "@eristack/hash-chained-ledger":
    "@eristack/hash-chained-ledger#hash-chained-ledger-core",
  "@eristack/backseat": "@eristack/backseat",
  "@eristack/multitab": "@eristack/multitab",
  "@eristack/ai-knowledge": "@eristack/ai-knowledge#agent-workflow",
  "@eristack/ai-workflow": "@eristack/ai-workflow#ai-workflow-core",
  "@eristack/ai-ticket-generator":
    "@eristack/ai-ticket-generator#ai-ticket-bug",
  "@eristack/ai-dev": "@eristack/ai-dev#ai-dev-core",
  "@eristack/web": "@eristack/ai-knowledge#architecture-recommend",
};

type PathRule = {
  pattern: RegExp;
  checks: CheckId[];
  sync?: ("docs" | "knowledge")[];
  profileHint?: CheckProfile;
};

const PATH_RULES: PathRule[] = [
  { pattern: /^\.changeset\//, checks: ["changesets"] },
  {
    pattern: /^packages\/ai\/ai-knowledge\//,
    checks: ["knowledge"],
    sync: ["knowledge"],
  },
  {
    pattern: /^packages\/[^/]+\/[^/]+\/docs\//,
    checks: ["docs"],
    sync: ["docs"],
  },
  { pattern: /^packages\/[^/]+\/[^/]+\/skills\//, checks: ["skills"] },
  { pattern: /^packages\/[^/]+\/[^/]+\/ticket\.yaml$/, checks: ["ticket"] },
  {
    pattern: /^packages\/[^/]+\/[^/]+\/package\.json$/,
    checks: ["exports"],
  },
  { pattern: /^scripts\//, checks: ["exports", "changesets", "docs"] },
  { pattern: /^apps\/web\//, checks: ["contrast", "lint"] },
  { pattern: /^examples\//, checks: ["examples"] },
  {
    pattern: /^packages\/[^/]+\/[^/]+\/(tests?|src)\//,
    checks: ["build", "typecheck", "test"],
    profileHint: "fast",
  },
  {
    pattern: /^packages\/[^/]+\/[^/]+\/src\//,
    checks: ["build", "typecheck", "test"],
    profileHint: "fast",
  },
];

export type DevPlan = {
  profile: CheckProfile;
  changed: string[];
  packages: string[];
  checks: CheckId[];
  sync: ("docs" | "knowledge")[];
  skills: string[];
  commands: string[];
  note?: string;
  /** Next open item from `_ai-docs/brainstorm/improvements.md` (e.g. `M2`). */
  nextBrainstormItem?: string;
};

export function gitChangedFiles(
  repoRoot: string,
  base = "main",
): string[] {
  const attempts = [
    `git diff --name-only ${base}...HEAD`,
    "git diff --name-only HEAD",
    "git diff --name-only --cached",
  ];
  for (const cmd of attempts) {
    try {
      const out = execSync(cmd, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (out) return out.split("\n").filter(Boolean);
    } catch {
      // try next
    }
  }
  return [];
}

export function planFromPaths(
  repoRoot: string,
  paths: string[],
): DevPlan {
  const normalized = paths.map((p) => p.replace(/\\/g, "/"));
  const checkSet = new Set<CheckId>();
  const syncSet = new Set<"docs" | "knowledge">();
  let profileHint: CheckProfile | undefined;

  for (const rel of normalized) {
    for (const rule of PATH_RULES) {
      if (rule.pattern.test(rel)) {
        for (const id of rule.checks) checkSet.add(id);
        for (const s of rule.sync ?? []) syncSet.add(s);
        if (rule.profileHint) profileHint = rule.profileHint;
      }
    }
  }

  const packages = packagesFromPaths(repoRoot, normalized);
  const hasCode = checkSet.has("build");
  const profile: CheckProfile =
    profileHint ??
    (hasCode && packages.length > 0 && packages.length <= 4
      ? "fast"
      : hasCode
        ? "pr"
        : "catalog");

  const checks = [...checkSet];
  const finalChecks =
    profile === "catalog"
      ? checksForProfile("catalog").map((d) => d.id)
      : profile === "fast" && packages.length
        ? (["build", "typecheck", "test"] as CheckId[])
        : checks.length
          ? checks
          : checksForProfile("pr").map((d) => d.id);

  const skills = [
    ...new Set(
      packages.map((name) => PACKAGE_SKILL[name]).filter(Boolean) as string[],
    ),
  ];

  const filter =
    profile === "fast" && packages.length
      ? packages.map((p) => `--filter=${p}...`).join(" ")
      : "";

  const commands: string[] = [];
  if (syncSet.has("knowledge")) commands.push("pnpm eristack sync knowledge");
  if (syncSet.has("docs")) commands.push("pnpm eristack sync docs");
  if (profile === "fast" && filter) {
    commands.push(`pnpm turbo run build typecheck test ${filter}`);
  } else {
    commands.push(`pnpm eristack check --profile ${profile}`);
  }

  return {
    profile,
    changed: normalized,
    packages,
    checks: finalChecks,
    sync: [...syncSet],
    skills,
    commands,
    nextBrainstormItem: nextBrainstormItem(repoRoot),
    note:
      normalized.length === 0
        ? "No git diff — defaulting to catalog profile; pass paths as args to narrow."
        : undefined,
  };
}

export function planFromGit(
  repoRoot: string,
  base = "main",
): DevPlan {
  const changed = gitChangedFiles(repoRoot, base);
  return planFromPaths(repoRoot, changed);
}
