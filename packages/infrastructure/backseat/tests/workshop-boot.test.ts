import { describe, expect, it } from "vitest";
import { createMemoryBackseatStore } from "../src/core/memory-store.js";
import { bootWorkshopServer } from "../src/workshop/index.js";

describe("bootWorkshopServer", () => {
  it("creates backseat and runs registerRoutes + seed", async () => {
    const store = createMemoryBackseatStore();
    let registered = false;
    let seeded = false;

    const backseat = await bootWorkshopServer({
      store,
      baseUrl: "/api",
      registerRoutes: (api) => {
        registered = true;
        api.registerCollection("widgets", {});
      },
      seed: async () => {
        seeded = true;
        await store.create("widgets", { id: "w1", name: "A" });
      },
    });

    expect(registered).toBe(true);
    expect(seeded).toBe(true);
    expect(await store.list("widgets")).toHaveLength(1);

    const response = await backseat.fetch("/api/widgets");
    expect(response.status).toBe(200);
  });
});
