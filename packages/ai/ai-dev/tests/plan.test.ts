import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findRepoRoot } from "../src/repo/root.js";
import { packagesFromPaths } from "../src/repo/packages.js";
import { planFromPaths } from "../src/plan/from-paths.js";
import { checksForProfile } from "../src/checks/registry.js";

const repoRoot = findRepoRoot(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

describe("packagesFromPaths", () => {
  it("maps source edits to @eristack/money", () => {
    const names = packagesFromPaths(repoRoot, [
      "packages/primitive/money/src/index.ts",
    ]);
    expect(names).toContain("@eristack/money");
  });
});

describe("planFromPaths", () => {
  it("suggests fast profile for single-package src change", () => {
    const plan = planFromPaths(repoRoot, [
      "packages/primitive/money/src/foo.ts",
    ]);
    expect(plan.profile).toBe("fast");
    expect(plan.packages).toContain("@eristack/money");
    expect(plan.skills).toContain("@eristack/money#money-amounts");
  });

  it("suggests catalog profile for changeset-only edits", () => {
    const plan = planFromPaths(repoRoot, [
      ".changeset/foo.md",
    ]);
    expect(plan.profile).toBe("catalog");
    expect(plan.checks).toContain("changesets");
  });
});

describe("checksForProfile", () => {
  it("pr includes ticket and contrast (CI parity)", () => {
    const ids = checksForProfile("pr").map((d) => d.id);
    expect(ids).toContain("ticket");
    expect(ids).toContain("contrast");
  });
});
