import { describe, expect, it } from "vitest";
import { diffRoutesSnapshots, type RoutesSnapshot } from "../src/core/routes-meta.js";

describe("diffRoutesSnapshots", () => {
  const base: RoutesSnapshot = {
    generatedAt: "2026-01-01",
    baseUrl: "/api",
    routes: [
      { method: "GET", path: "/orders", fullPath: "/api/orders" },
    ],
    actions: [],
  };

  it("detects added and removed routes", () => {
    const next: RoutesSnapshot = {
      ...base,
      routes: [
        { method: "GET", path: "/orders", fullPath: "/api/orders", name: "orders.list" },
        { method: "POST", path: "/orders", fullPath: "/api/orders" },
      ],
    };

    const diffs = diffRoutesSnapshots(base, next);
    expect(diffs.some((d) => d.kind === "changed" && d.path === "/api/orders")).toBe(true);
    expect(diffs.some((d) => d.kind === "added" && d.method === "POST")).toBe(true);
  });
});
