import { describe, expect, it } from "vitest";
import {
  assertDataGridEnvelope,
  assertRoutesSnapshotsEqual,
  routesSnapshotsMatch,
} from "../src/testing/mirror-contract.js";
import type { RoutesSnapshot } from "../src/core/routes-meta.js";

describe("mirror contract helpers", () => {
  const base: RoutesSnapshot = {
    generatedAt: "2026-01-01",
    baseUrl: "/api",
    routes: [{ method: "GET", path: "/jobs", fullPath: "/api/jobs" }],
    actions: [],
  };

  it("assertRoutesSnapshotsEqual passes on match", () => {
    expect(() => assertRoutesSnapshotsEqual(base, { ...base })).not.toThrow();
    expect(routesSnapshotsMatch(base, { ...base })).toBe(true);
  });

  it("assertDataGridEnvelope validates list shape", () => {
    assertDataGridEnvelope({
      items: [],
      pageInfo: { mode: "offset", page: 1, pageSize: 10, total: 0, totalPages: 1 },
      query: { filters: [], sorts: [], page: { mode: "offset", page: 1, pageSize: 10 } },
    });
    expect(() => assertDataGridEnvelope({ items: [] })).toThrow(/pageInfo/);
  });
});
