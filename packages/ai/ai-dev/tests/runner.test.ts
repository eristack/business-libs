import { describe, expect, it } from "vitest";
import { checksForProfile } from "../src/checks/registry.js";

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

  it("pr profile includes build, test, publish, and catalog checks", () => {
    const ids = checksForProfile("pr").map((c) => c.id);
    expect(ids).toContain("build");
    expect(ids).toContain("test");
    expect(ids).toContain("publish");
    expect(ids).toContain("knowledge");
    expect(ids).toContain("integration");
    expect(ids).toContain("examples");
  });
});
