import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { checksForProfile } from "../src/checks/registry.js";
import { runChecks } from "../src/checks/runner.js";
import { findRepoRoot } from "../src/repo/root.js";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(() => ""),
}));

const repoRoot = findRepoRoot(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

describe("checksForProfile", () => {
  it("publish profile runs publish check only", () => {
    expect(checksForProfile("publish").map((c) => c.id)).toEqual(["publish"]);
  });

  it("features profile runs features check only", () => {
    expect(checksForProfile("features").map((c) => c.id)).toEqual(["features"]);
  });

  it("integration profile runs integration check only", () => {
    expect(checksForProfile("integration").map((c) => c.id)).toEqual([
      "integration",
    ]);
  });

  it("ticket check bootstraps ai-ticket-generator build before cli check", () => {
    const mocked = vi.mocked(execSync);
    mocked.mockClear();
    const results = runChecks({
      repoRoot,
      profile: "catalog",
      only: ["ticket"],
      skipBuild: true,
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.ok).toBe(true);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(String(mocked.mock.calls[0]?.[0])).toContain(
      "build --filter=@eristack/ai-ticket-generator",
    );
    expect(String(mocked.mock.calls[1]?.[0])).toContain(
      "@eristack/ai-ticket-generator",
    );
    expect(String(mocked.mock.calls[1]?.[0])).toContain("check");
  });

  it("skipBuild never inserts a build before needsBuild checks", () => {
    const mocked = vi.mocked(execSync);
    mocked.mockClear();
    runChecks({ repoRoot, profile: "pr", only: ["exports"], skipBuild: true });
    expect(mocked).toHaveBeenCalledTimes(1);
    expect(String(mocked.mock.calls[0]?.[0])).toContain("check-package-exports");
  });

  it("integration verifies turbo-test coverage in pr, runs suites in its own profile", () => {
    const mocked = vi.mocked(execSync);
    mocked.mockClear();
    runChecks({ repoRoot, profile: "pr", only: ["integration"], skipBuild: true });
    expect(String(mocked.mock.calls[0]?.[0])).toContain("--verify-covered");
    mocked.mockClear();
    runChecks({ repoRoot, profile: "integration", skipBuild: true });
    expect(String(mocked.mock.calls[0]?.[0])).toBe("pnpm test:integration");
  });

  it("examples filter is quoted so the shell cannot expand it", () => {
    const mocked = vi.mocked(execSync);
    mocked.mockClear();
    runChecks({ repoRoot, profile: "examples", skipBuild: true });
    expect(String(mocked.mock.calls[0]?.[0])).toContain("'--filter=./examples/*'");
  });

  it("pr profile includes build, test, publish, and catalog checks", () => {
    const ids = checksForProfile("pr").map((c) => c.id);
    expect(ids).toContain("build");
    expect(ids).toContain("test");
    expect(ids).toContain("publish");
    expect(ids).toContain("knowledge");
    expect(ids).toContain("skill-sources");
    expect(ids).toContain("agents-intent-sync");
    expect(ids).toContain("memory-exports");
    expect(ids).toContain("debottleneck");
    expect(ids).toContain("integration");
    expect(ids).toContain("examples");
  });
});
