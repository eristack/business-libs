import { and, eq, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import type { GridColumn } from "./query.js";

export type AssignmentPair = Record<string, unknown>;

export type AssignmentScopeColumns = {
  branchId: GridColumn;
  trade: GridColumn;
};

export type AssignmentScopeWhereOptions = {
  pairBranchKey?: string;
  pairTradeKey?: string;
};

/**
 * Drizzle `WHERE` fragment: OR of `(branchId, trade)` pairs.
 * Empty assignments ⇒ match nothing (`0 = 1`).
 * Pair with {@link assignmentScopePrefilter} from `@eristack/abac` + shared tests.
 */
export function assignmentScopeWhere(
  columns: AssignmentScopeColumns,
  assignments: readonly AssignmentPair[],
  options: AssignmentScopeWhereOptions = {},
): SQL {
  if (assignments.length === 0) {
    return sql`0 = 1`;
  }
  const branchKey = options.pairBranchKey ?? "branchId";
  const tradeKey = options.pairTradeKey ?? "trade";
  const branchCol = columns.branchId as AnyColumn;
  const tradeCol = columns.trade as AnyColumn;
  const clauses = assignments.map((pair) =>
    and(eq(branchCol, pair[branchKey]), eq(tradeCol, pair[tradeKey])),
  );
  const combined = or(...clauses);
  if (!combined) {
    return sql`0 = 1`;
  }
  return combined;
}
