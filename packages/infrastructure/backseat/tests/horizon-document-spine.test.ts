import { describe, expect, it } from "vitest";
import { createBackseat, createMemoryBackseatStore } from "../src/index.js";
import { registerHorizonDocumentSpine } from "../src/seeds/horizon-document-spine.js";
import { createPbac } from "@eristack/pbac";

describe("registerHorizonDocumentSpine", () => {
  it("mounts pbac, epoch, and qups routes", async () => {
    const api = createBackseat({
      store: createMemoryBackseatStore(),
      baseUrl: "/api",
    });
    const pbac = createPbac();

    await registerHorizonDocumentSpine(api, { pbac });

    const paths = api.listRoutes().map((r) => `${r.method} ${r.fullPath ?? r.path}`);
    expect(paths.some((p) => p.includes("/qups/"))).toBe(true);
    expect(paths.some((p) => p.includes("/epoch/"))).toBe(true);
    expect(paths.some((p) => p.includes("/pbac/"))).toBe(true);
  });
});
