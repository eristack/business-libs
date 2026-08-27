import type { AbacContext, AbacPolicy, AttrValue } from "./types.js";

function readPath(root: unknown, path: string): AttrValue {
  const parts = path.split(".").filter(Boolean);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur as AttrValue;
}

export type MatchesAssignmentPairOptions = {
  /** Key on each pair object. Default `branchId`. */
  pairBranchKey?: string;
  /** Key on each pair object. Default `trade`. */
  pairTradeKey?: string;
};

/**
 * Pure scope check: true when some pair matches resource branch + trade.
 * Use in list prefilters (`executeBackseatList`) and ABAC policies.
 */
export function matchesAssignmentPair(
  pairs: readonly Record<string, unknown>[],
  resourceBranch: unknown,
  resourceTrade: unknown,
  options: MatchesAssignmentPairOptions = {},
): boolean {
  const branchKey = options.pairBranchKey ?? "branchId";
  const tradeKey = options.pairTradeKey ?? "trade";
  if (resourceBranch == null || resourceTrade == null) return false;
  return pairs.some(
    (pair) =>
      pair[branchKey] === resourceBranch && pair[tradeKey] === resourceTrade,
  );
}

export type AssignmentPairMatchOptions = {
  /** Dot path to assignment array (e.g. `subject.attrs.assignments`). */
  pairsPath: string;
  resourceBranchPath: string;
  resourceTradePath: string;
  pairBranchKey?: string;
  pairTradeKey?: string;
  reason?: string;
};

/** ABAC policy: allow when an assignment pair matches resource branch + trade. */
export function assignmentPairMatch(
  options: AssignmentPairMatchOptions,
): AbacPolicy["evaluate"] {
  const pairOpts: MatchesAssignmentPairOptions = {
    pairBranchKey: options.pairBranchKey,
    pairTradeKey: options.pairTradeKey,
  };
  return (ctx: AbacContext) => {
    const raw = readPath(ctx, options.pairsPath);
    const pairs = Array.isArray(raw)
      ? raw.filter((item) => item && typeof item === "object")
      : [];
    const branch = readPath(ctx, options.resourceBranchPath);
    const trade = readPath(ctx, options.resourceTradePath);
    const ok = matchesAssignmentPair(
      pairs as Record<string, unknown>[],
      branch,
      trade,
      pairOpts,
    );
    return {
      allowed: ok,
      policyId: "",
      reason: ok
        ? undefined
        : options.reason ?? "No matching assignment pair for resource scope",
    };
  };
}
