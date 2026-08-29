import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runSync } from "../src/sync/run.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

describe("runSync", () => {
  it("knowledge check succeeds when catalog is in sync", () => {
    const result = runSync(repoRoot, "knowledge", true);
    expect(result.target).toBe("knowledge");
    expect(result.check).toBe(true);
    expect(result.ok).toBe(true);
  });

  it("docs check succeeds when nav catalog matches package docs", () => {
    const result = runSync(repoRoot, "docs", true);
    expect(result.target).toBe("docs");
    expect(result.check).toBe(true);
    expect(result.ok).toBe(true);
  });
});
