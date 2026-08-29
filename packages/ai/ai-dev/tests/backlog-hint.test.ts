import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { nextBrainstormItem } from "../src/plan/backlog-hint.js";
import { planFromPaths } from "../src/plan/from-paths.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

describe("nextBrainstormItem", () => {
  it("returns the first open brainstorm row id", () => {
    const id = nextBrainstormItem(repoRoot);
    expect(id).toMatch(/^[A-Z]+\d+$/);
  });
});

describe("planFromPaths", () => {
  it("includes nextBrainstormItem in DevPlan JSON", () => {
    const plan = planFromPaths(repoRoot, ["packages/primitive/money/package.json"]);
    expect(plan.nextBrainstormItem).toMatch(/^[A-Z]+\d+$/);
  });
});
