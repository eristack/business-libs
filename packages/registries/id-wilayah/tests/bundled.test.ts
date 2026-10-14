import { describe, expect, it } from "vitest";
import {
  loadBundledAdminDivisionRegistry,
  loadBundledAdminDivisionRows,
} from "../src/bundled/load.js";

describe("bundled official snapshot", () => {
  it(
    "decodes gzip rows with expected province and village counts",
    async () => {
      const rows = await loadBundledAdminDivisionRows();
      expect(rows.length).toBeGreaterThan(80_000);
      const provinces = rows.filter((r) => r.k === "province");
      expect(provinces).toHaveLength(38);
      expect(rows.some((r) => r.c === "3171010001")).toBe(true);
    },
    30_000,
  );

  it(
    "builds registry from cached rows",
    async () => {
      const registry = await loadBundledAdminDivisionRegistry();
      expect(registry.size).toBeGreaterThan(80_000);
      expect(registry.require("31").kind).toBe("province");
    },
    30_000,
  );
});
