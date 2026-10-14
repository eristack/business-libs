import { describe, expect, it } from "vitest";
import { loadBundledAdminDivisionRegistry } from "../src/bundled/load.js";

describe("loadBundledAdminDivisionRegistry", () => {
  it("loads national snapshot with expected province count", async () => {
    const registry = await loadBundledAdminDivisionRegistry();
    expect(registry.size).toBeGreaterThan(80_000);
    expect(registry.listByKind("province")).toHaveLength(38);
    expect(registry.require("31").kind).toBe("province");
    expect(registry.get("3171010001")).toBeDefined();
  });
});
