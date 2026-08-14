import { describe, expect, it } from "vitest";
import {
  getCatalog,
  listPackages,
  listRecipes,
  listSkills,
  loadPlan,
  recommend,
} from "../src/index.js";

describe("catalog", () => {
  it("lists sibling eristack packages with skills", () => {
    const packages = listPackages();
    const names = packages.map((pkg) => pkg.name).sort();
    expect(names).toEqual(
      [
        "@eristack/abac",
        "@eristack/ai-ticket-generator",
        "@eristack/ai-workflow",
        "@eristack/data-grid",
        "@eristack/doc-number",
        "@eristack/financial-ledger",
        "@eristack/hash-chained-ledger",
        "@eristack/jwt-auth",
        "@eristack/money",
        "@eristack/pbac",
        "@eristack/qups",
        "@eristack/rbac",
        "@eristack/stock-movement",
        "@eristack/valuations",
        "@eristack/backseat",
        "@eristack/multitab",
      ].sort(),
    );
    expect(listSkills().length).toBeGreaterThanOrEqual(6);
    expect(getCatalog().packages.every((pkg) => pkg.skills.length > 0)).toBe(
      true,
    );
  });

  it("does not catalog ai-knowledge itself", () => {
    expect(
      listPackages().some((pkg) => pkg.name === "@eristack/ai-knowledge"),
    ).toBe(false);
  });
});

describe("recommend", () => {
  it("prioritizes eristack packages for common product asks", () => {
    const result = recommend(["invoices", "login", "document numbers"]);
    expect(result.matches.length).toBeGreaterThan(0);
    const packageNames = new Set(
      result.matches.flatMap((match) =>
        match.recipe.packages.map((pkg) => pkg.name),
      ),
    );
    expect(packageNames.has("@eristack/money")).toBe(true);
    expect(packageNames.has("@eristack/jwt-auth")).toBe(true);
    expect(packageNames.has("@eristack/doc-number")).toBe(true);
    expect(result.fallbackNote).toBeNull();
  });

  it("returns a fallback note when nothing matches", () => {
    const result = recommend("quantum teleportation scheduler");
    expect(result.matches).toEqual([]);
    expect(result.fallbackNote).toMatch(/No Eristack package matched/i);
  });

  it("keeps eristack matches when some goals are unknown", () => {
    const result = recommend(["tax", "drone delivery routing"]);
    expect(result.matches.some((m) => m.recipe.id === "money-amounts")).toBe(
      true,
    );
    expect(result.unmatched.length).toBeGreaterThan(0);
    expect(result.fallbackNote).toMatch(/Some goals had no Eristack recipe/i);
  });
});

describe("loadPlan", () => {
  it("emits ordered intent load commands without duplicates", () => {
    const plan = loadPlan("erp invoicing app");
    expect(plan.steps.length).toBeGreaterThan(0);
    const keys = plan.steps.map((step) => `${step.packageName}#${step.skillId}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const step of plan.steps) {
      expect(step.loadCommand).toContain(
        `@tanstack/intent@latest load ${step.packageName}#${step.skillId}`,
      );
    }
  });
});

describe("recipes", () => {
  it("only references packages and skills in the catalog", () => {
    const skillKeys = new Set(
      listSkills().map((skill) => `${skill.packageName}#${skill.id}`),
    );
    const packageNames = new Set(listPackages().map((pkg) => pkg.name));

    for (const recipe of listRecipes()) {
      for (const ref of recipe.packages) {
        expect(packageNames.has(ref.name)).toBe(true);
        for (const skill of ref.skills) {
          expect(skillKeys.has(`${ref.name}#${skill}`)).toBe(true);
        }
      }
    }
  });
});
