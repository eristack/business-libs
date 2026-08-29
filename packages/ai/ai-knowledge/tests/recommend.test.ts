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
        "@eristack/address",
        "@eristack/ai-dev",
        "@eristack/ai-ticket-generator",
        "@eristack/ai-workflow",
        "@eristack/backseat",
        "@eristack/data-grid",
        "@eristack/doc-number",
        "@eristack/doc-transitions",
        "@eristack/epoch",
        "@eristack/financial-ledger",
        "@eristack/fiscal-calendar",
        "@eristack/hash-chained-ledger",
        "@eristack/jwt-auth",
        "@eristack/logger",
        "@eristack/money",
        "@eristack/multitab",
        "@eristack/opinion",
        "@eristack/pbac",
        "@eristack/percent",
        "@eristack/qups",
        "@eristack/rbac",
        "@eristack/rest",
        "@eristack/stock-movement",
        "@eristack/timestamp",
        "@eristack/uom",
        "@eristack/valuations",
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

  it("routes qups truth mode and amount-only form language to line-pricing-qups", () => {
    const result = recommend(["qups truth mode", "flat amount line form"]);
    expect(
      result.matches.some((m) => m.recipe.id === "line-pricing-qups"),
    ).toBe(true);
    const qups = result.matches.find((m) => m.recipe.id === "line-pricing-qups");
    expect(
      qups?.recipe.packages.some((p) => p.name === "@eristack/money"),
    ).toBe(true);
  });

  it("routes decimal money list columns to data-grid-lists", () => {
    const result = recommend(["sort unit price list", "decimal column filter"]);
    expect(
      result.matches.some((m) => m.recipe.id === "data-grid-lists"),
    ).toBe(true);
  });

  it("routes applyCellPatch language to line-pricing-qups", () => {
    const result = recommend(["applyCellPatch spreadsheet line"]);
    expect(
      result.matches.some((m) => m.recipe.id === "line-pricing-qups"),
    ).toBe(true);
  });

  it("routes store atomic writes to backseat mock backend", () => {
    const result = recommend(["store atomic multi collection"]);
    expect(
      result.matches.some((m) => m.recipe.id === "backseat-mock-backend"),
    ).toBe(true);
  });

  it("routes wall date filters to data-grid-lists", () => {
    const result = recommend(["wall date filter list"]);
    expect(
      result.matches.some((m) => m.recipe.id === "data-grid-lists"),
    ).toBe(true);
  });

  it("routes compareDecimalStrings to data-grid-lists", () => {
    const result = recommend(["compareDecimalStrings money column"]);
    expect(
      result.matches.some((m) => m.recipe.id === "data-grid-lists"),
    ).toBe(true);
  });

  it("routes bumpMany to epoch-cache-invalidation", () => {
    const result = recommend(["bumpMany epoch scopes"]);
    expect(
      result.matches.some((m) => m.recipe.id === "epoch-cache-invalidation"),
    ).toBe(true);
  });

  it("routes documents.transitions to access-control-stack", () => {
    const result = recommend(["documents.transitions status action"]);
    expect(
      result.matches.some((m) => m.recipe.id === "access-control-stack"),
    ).toBe(true);
  });

  it("routes assignmentPairMatch to access-control-stack", () => {
    const result = recommend(["assignmentPairMatch role policy"]);
    expect(
      result.matches.some((m) => m.recipe.id === "access-control-stack"),
    ).toBe(true);
  });

  it("routes structured logging to structured-logging recipe", () => {
    const result = recommend(["json log drain request id"]);
    expect(
      result.matches.some((m) => m.recipe.id === "structured-logging"),
    ).toBe(true);
  });

  it("routes declarative REST to declarative-rest-routes recipe", () => {
    const result = recommend(["declarative rest express routes"]);
    expect(
      result.matches.some((m) => m.recipe.id === "declarative-rest-routes"),
    ).toBe(true);
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

  it("merges canonicalSkills from ERP recipes before package skills", () => {
    const plan = loadPlan(recommend(["document with lines"]));
    const keys = plan.steps.map((step) => `${step.packageName}#${step.skillId}`);
    expect(keys).toContain("@eristack/ai-knowledge#document-lines-erp");
    expect(keys.indexOf("@eristack/ai-knowledge#document-lines-erp")).toBeLessThan(
      keys.indexOf("@eristack/qups#qups-line"),
    );
  });

});

describe("recommend disambiguation", () => {
  it("routes document-with-lines to document-lines-erp without compose-spine", () => {
    const result = recommend(["document with lines", "cost sheet lines"]);
    expect(result.matches[0]?.recipe.id).toBe("document-lines-erp");
    expect(result.matches.some((m) => m.recipe.id === "compose-spine")).toBe(
      false,
    );
  });

  it("routes explicit GL ask to financial-ledger recipe", () => {
    const result = recommend(["general ledger posting"]);
    expect(
      result.matches.some((m) =>
        m.recipe.packages.some((p) => p.name === "@eristack/financial-ledger"),
      ),
    ).toBe(true);
  });

  it("routes inventory transfer to stock-movement recipe", () => {
    const result = recommend(["inventory transfer"]);
    expect(
      result.matches.some((m) =>
        m.recipe.packages.some((p) => p.name === "@eristack/stock-movement"),
      ),
    ).toBe(true);
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
