import {
  diffRoutesSnapshots,
  type RouteDiffEntry,
  type RoutesSnapshot,
} from "../core/routes-meta.js";

export type { RoutesSnapshot, RouteDiffEntry };

/** True when snapshot diff is empty (Horizon A vs B route parity). */
export function routesSnapshotsMatch(
  baseline: RoutesSnapshot,
  candidate: RoutesSnapshot,
): boolean {
  return diffRoutesSnapshots(baseline, candidate).length === 0;
}

/**
 * Diff two snapshots; throws with human-readable summary when mismatched.
 * Use in CI after exporting `routesSnapshot()` from Backseat and Express boot.
 */
export function assertRoutesSnapshotsEqual(
  baseline: RoutesSnapshot,
  candidate: RoutesSnapshot,
  label = "routes",
): void {
  const diffs = diffRoutesSnapshots(baseline, candidate);
  if (diffs.length === 0) {
    return;
  }
  const lines = diffs.map((d) => `${d.kind} ${d.method} ${d.path}`);
  throw new Error(`${label} mismatch:\n${lines.join("\n")}`);
}

/** Parse snapshot JSON written by devtools or `formatRoutesSnapshot`. */
export function parseRoutesSnapshotJson(text: string): RoutesSnapshot {
  const value = JSON.parse(text) as RoutesSnapshot;
  if (!value || typeof value !== "object" || !Array.isArray(value.routes)) {
    throw new Error("Invalid routes snapshot JSON");
  }
  return value;
}

/** GET routes safe for default mirror smoke (no destructive probes). */
export function isSafeMirrorGetRoute(method: string): boolean {
  return method.toUpperCase() === "GET";
}

/** Assert `{ items, pageInfo, query }` list envelope from data-grid / Backseat list. */
export function assertDataGridEnvelope(body: unknown): void {
  if (typeof body !== "object" || body === null) {
    throw new Error("DataGrid envelope must be an object");
  }
  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.items)) {
    throw new Error("DataGrid envelope missing items array");
  }
  const pageInfo = record.pageInfo;
  if (typeof pageInfo !== "object" || pageInfo === null) {
    throw new Error("DataGrid envelope missing pageInfo");
  }
  const query = record.query;
  if (typeof query !== "object" || query === null) {
    throw new Error("DataGrid envelope missing query");
  }
}
