import { describe, expect, it } from "vitest";
import { loadHorizonASeedV1 } from "@eristack/backseat/seeds";
import { createHorizonBackseat } from "../src/backseat/register.js";
import { registerOrderRoutes } from "../src/routes/orders.js";

type ErrorBody = { error?: { code?: string; message?: string } };

describe("Horizon A — http-errors canon (409 envelope)", () => {
  async function setup() {
    const { api, pbac, epoch } = await createHorizonBackseat();
    registerOrderRoutes(api, { pbac, epoch });
    await api.store.importSnapshot(loadHorizonASeedV1());
    return api;
  }

  it("returns CONFLICT_VERSION when expectedVersion is stale", async () => {
    const api = await setup();

    const submit = await api.handle({
      method: "PATCH",
      path: "/api/orders/ord_demo",
      body: { expectedVersion: 1, action: "submit" },
    });
    expect(submit.status).toBe(200);

    const stale = await api.handle({
      method: "PATCH",
      path: "/api/orders/ord_demo",
      body: { expectedVersion: 1, action: "approve" },
    });
    expect(stale.status).toBe(409);
    expect((stale.body as ErrorBody).error?.code).toBe("CONFLICT_VERSION");
  });

  it("returns BUSINESS_POLICY_DENIED for illegal transition", async () => {
    const api = await setup();

    const deny = await api.handle({
      method: "PATCH",
      path: "/api/orders/ord_demo",
      body: { expectedVersion: 1, action: "approve" },
    });
    expect(deny.status).toBe(409);
    expect((deny.body as ErrorBody).error?.code).toBe("BUSINESS_POLICY_DENIED");
  });
});
