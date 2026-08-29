import { describe, expect, it } from "vitest";
import { loadHorizonASeedV1 } from "@eristack/backseat/seeds";
import { createHorizonBackseat } from "../src/backseat/register.js";
import { registerOrderRoutes } from "../src/routes/orders.js";
import { createHorizonEpochClient } from "../src/lib/epoch-client.js";

describe("Horizon A epoch cache policy", () => {
  it("returns use-cache then refetch after order write bumps epoch", async () => {
    const { api, pbac, epoch } = createHorizonBackseat();
    registerOrderRoutes(api, { pbac, epoch });
    await api.store.importSnapshot(loadHorizonASeedV1());

    const client = createHorizonEpochClient(api);
    const cachedEpoch = await client.current("orders");

    const fresh = await client.resolveCachePolicy("orders", cachedEpoch);
    expect(fresh.policy).toBe("use-cache");

    await api.handle({
      method: "PATCH",
      path: "/api/orders/ord_demo",
      body: { expectedVersion: 1, action: "submit" },
    });

    const stale = await client.resolveCachePolicy("orders", cachedEpoch);
    expect(stale.policy).toBe("refetch");
    expect(stale.current).toBeGreaterThan(cachedEpoch);
  });
});
