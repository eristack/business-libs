import { describe, expect, it } from "vitest";
import { createHorizonBackseat } from "../src/backseat/register.js";
import { registerOrderRoutes } from "../src/routes/orders.js";

describe("Horizon A spine routes", () => {
  it("registers orders, grid, epoch, auth, and qups routes", () => {
    const { api, pbac, epoch } = createHorizonBackseat();
    registerOrderRoutes(api, { pbac, epoch });

    const paths = api.listRoutes().map((r) => `${r.method} ${r.fullPath ?? r.path}`);
    const mustInclude = [
      "GET /api/orders",
      "PATCH /api/orders/:id",
      "GET /api/orders-grid",
      "GET /api/epoch/:scope",
      "POST /api/auth/login",
      "POST /api/qups/calculate-line",
    ];

    for (const route of mustInclude) {
      expect(paths).toContain(route);
    }
    expect(paths.length).toBeGreaterThanOrEqual(12);
  });
});
