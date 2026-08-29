export type TransitionTable = Readonly<Record<string, readonly string[]>>;

export type TransitionTableIssue =
  | { kind: "empty-status" }
  | { kind: "empty-actions"; status: string }
  | { kind: "duplicate-action"; status: string; action: string };

/** Validate a status → allowed-actions table before registering PBAC policies. */
export function validateTransitionTable(
  table: TransitionTable,
): TransitionTableIssue[] {
  const issues: TransitionTableIssue[] = [];

  for (const [status, actions] of Object.entries(table)) {
    if (!status.trim()) {
      issues.push({ kind: "empty-status" });
      continue;
    }
    if (actions.length === 0) {
      issues.push({ kind: "empty-actions", status });
    }
    const seen = new Set<string>();
    for (const action of actions) {
      if (seen.has(action)) {
        issues.push({ kind: "duplicate-action", status, action });
      }
      seen.add(action);
    }
  }

  return issues;
}

export function assertValidTransitionTable(table: TransitionTable): void {
  const issues = validateTransitionTable(table);
  if (issues.length === 0) return;
  throw new Error(
    `Invalid transition table: ${issues.map((i) => JSON.stringify(i)).join("; ")}`,
  );
}
