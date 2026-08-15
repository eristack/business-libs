import { describe, expect, it } from "vitest";

/**
 * Consumer-style resolution: imports must work through package.json "exports"
 * (same check Vite/npm use). Catches missing ./adapters on publish.
 */
describe("@eristack/backseat package exports", () => {
  it("resolves ./adapters (spine packages depend on this subpath)", async () => {
    const mod = await import("@eristack/backseat/adapters");
    expect(mod.registerRestLikeRoutes).toBeTypeOf("function");
    expect(mod.asDate).toBeTypeOf("function");
    expect(mod.asNullableDate).toBeTypeOf("function");
    expect(mod.toRestLikeRequest).toBeTypeOf("function");
  });

  it("resolves ./store", async () => {
    const mod = await import("@eristack/backseat/store");
    expect(mod.createIndexedDbBackseatStore).toBeTypeOf("function");
  });
});
