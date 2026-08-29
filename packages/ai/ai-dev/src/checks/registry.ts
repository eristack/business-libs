/** Check profiles — one vocabulary for local dev, CI, and MCP. */
export type CheckProfile = "catalog" | "pr" | "full" | "fast" | "integration";

export type CheckId =
  | "build"
  | "typecheck"
  | "test"
  | "integration"
  | "examples"
  | "lint"
  | "exports"
  | "changesets"
  | "publish"
  | "skills"
  | "knowledge"
  | "docs"
  | "ticket"
  | "contrast";

export type CheckDef = {
  id: CheckId;
  label: string;
  /** Profiles that include this check by default. */
  profiles: CheckProfile[];
  /** Runs after build when included in a profile. */
  needsBuild?: boolean;
  /** Supports turbo --filter when package scope is known. */
  turboFilter?: boolean;
  order: number;
};

export const CHECK_DEFS: CheckDef[] = [
  {
    id: "build",
    label: "turbo build",
    profiles: ["pr", "full", "fast"],
    order: 10,
  },
  {
    id: "typecheck",
    label: "turbo typecheck",
    profiles: ["pr", "full", "fast"],
    turboFilter: true,
    needsBuild: true,
    order: 20,
  },
  {
    id: "test",
    label: "turbo test",
    profiles: ["pr", "full", "fast"],
    turboFilter: true,
    needsBuild: true,
    order: 30,
  },
  {
    id: "integration",
    label: "drizzle integration tests",
    profiles: ["pr", "full", "integration"],
    needsBuild: true,
    order: 31,
  },
  {
    id: "examples",
    label: "example apps typecheck",
    profiles: ["pr", "full"],
    order: 32,
  },
  {
    id: "lint",
    label: "turbo lint",
    profiles: ["full"],
    turboFilter: true,
    needsBuild: true,
    order: 35,
  },
  {
    id: "exports",
    label: "export map integrity",
    profiles: ["catalog", "pr", "full"],
    needsBuild: true,
    order: 40,
  },
  {
    id: "changesets",
    label: "changeset policy",
    profiles: ["catalog", "pr", "full"],
    order: 45,
  },
  {
    id: "publish",
    label: "publish dependency hygiene",
    profiles: ["pr", "full"],
    order: 46,
  },
  {
    id: "skills",
    label: "intent skills validate",
    profiles: ["catalog", "pr", "full"],
    order: 50,
  },
  {
    id: "knowledge",
    label: "ai-knowledge catalog sync",
    profiles: ["catalog", "pr", "full"],
    order: 55,
  },
  {
    id: "docs",
    label: "package docs catalog",
    profiles: ["catalog", "pr", "full"],
    order: 60,
  },
  {
    id: "ticket",
    label: "ticket.yaml subscriptions",
    profiles: ["catalog", "pr", "full"],
    order: 65,
  },
  {
    id: "contrast",
    label: "web contrast + brand tokens",
    profiles: ["catalog", "pr", "full"],
    order: 70,
  },
];

export function checksForProfile(
  profile: CheckProfile,
  opts?: { only?: CheckId[] },
): CheckDef[] {
  if (opts?.only?.length) {
    const set = new Set(opts.only);
    return CHECK_DEFS.filter((d) => set.has(d.id)).sort(
      (a, b) => a.order - b.order,
    );
  }
  return CHECK_DEFS.filter((d) => d.profiles.includes(profile)).sort(
    (a, b) => a.order - b.order,
  );
}

export function resolveProfile(input?: string): CheckProfile {
  if (
    input === "catalog" ||
    input === "pr" ||
    input === "full" ||
    input === "fast" ||
    input === "integration"
  ) {
    return input;
  }
  throw new Error(
    `Unknown profile "${input ?? ""}". Use catalog | pr | full | fast | integration.`,
  );
}
