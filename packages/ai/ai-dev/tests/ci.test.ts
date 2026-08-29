import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  packageJsonChanged,
  requiresFullCi,
  resolveCiPlanFromChanged,
  webAppChanged,
} from "../src/ci/run.js";
import { findRepoRoot } from "../src/repo/root.js";

const repoRoot = findRepoRoot(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

describe("requiresFullCi", () => {
  it("forces full when lockfile changes", () => {
    expect(requiresFullCi(["pnpm-lock.yaml"])).toBe(true);
  });

  it("forces full when ai-dev changes", () => {
    expect(requiresFullCi(["packages/ai/ai-dev/src/cli.ts"])).toBe(true);
  });

  it("allows affected for single-package src", () => {
    expect(
      requiresFullCi(["packages/primitive/money/src/index.ts"]),
    ).toBe(false);
  });
});

describe("resolveCiPlanFromChanged", () => {
  it("catalog mode for docs-only paths", () => {
    const plan = resolveCiPlanFromChanged(repoRoot, [
      "packages/primitive/money/docs/getting-started.md",
    ]);
    expect(plan.mode).toBe("catalog");
    expect(plan.webBuild).toBe(false);
    expect(plan.driftChecks).toContain("docs");
  });

  it("affected mode skips web build for library src", () => {
    const plan = resolveCiPlanFromChanged(repoRoot, [
      "packages/primitive/money/src/index.ts",
    ]);
    expect(plan.mode).toBe("affected");
    expect(plan.webBuild).toBe(false);
    expect(plan.driftChecks).toContain("examples");
    expect(plan.driftChecks).toContain("changesets");
    expect(plan.driftChecks).toContain("integration");
  });

  it("affected mode builds web when apps/web changes", () => {
    const plan = resolveCiPlanFromChanged(repoRoot, [
      "apps/web/src/lib/site.ts",
    ]);
    expect(plan.mode).toBe("affected");
    expect(plan.webBuild).toBe(true);
    expect(plan.driftChecks).toContain("contrast");
  });

  it("full mode when forced", () => {
    const plan = resolveCiPlanFromChanged(
      repoRoot,
      ["packages/primitive/money/docs/index.md"],
      "origin/main",
      { forceFull: true },
    );
    expect(plan.mode).toBe("full");
    expect(plan.webBuild).toBe(true);
  });

  it("full mode when lockfile changes", () => {
    const plan = resolveCiPlanFromChanged(repoRoot, ["pnpm-lock.yaml"]);
    expect(plan.mode).toBe("full");
  });
});

describe("path helpers", () => {
  it("detects package.json edits", () => {
    expect(
      packageJsonChanged(["packages/primitive/money/package.json"]),
    ).toBe(true);
  });

  it("detects web app edits", () => {
    expect(webAppChanged(["apps/web/src/app/page.tsx"])).toBe(true);
  });
});
