import { describe, expect, it } from "vitest";

describe("package exports", () => {
  it("loads core entry", async () => {
    const mod = await import("../src/index.js");
    expect(mod.createFileManager).toBeTypeOf("function");
    expect(mod.parseFileRef).toBeTypeOf("function");
  });

  it("loads testing entry", async () => {
    const mod = await import("../src/testing/index.js");
    expect(mod.createMemoryStorageDriver).toBeTypeOf("function");
  });
});
