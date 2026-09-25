import {
  matchesAssignmentPair,
  type MatchesAssignmentPairOptions,
} from "./assignment-pairs.js";

export type AssignmentScopeDoc = {
  branchId: unknown;
  trade: unknown;
};

/**
 * List prefilter for `executeBackseatList` — same semantics as SQL
 * {@link assignmentScopeWhere} in `@eristack/data-grid/drizzle`.
 * Empty assignments ⇒ no rows (security default).
 */
export function assignmentScopePrefilter(
  assignments: readonly Record<string, unknown>[],
  doc: AssignmentScopeDoc,
  options: MatchesAssignmentPairOptions = {},
): boolean {
  if (assignments.length === 0) {
    return false;
  }
  return matchesAssignmentPair(
    assignments,
    doc.branchId,
    doc.trade,
    options,
  );
}
