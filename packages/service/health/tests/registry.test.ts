import { describe, expect, it } from "vitest";

import { createHealthRegistry } from "../src/index.js";

describe("createHealthRegistry", () => {
  it("503 when a check is down", async () => {
    const registry = createHealthRegistry();
    registry.registerCheck("db", () => ({ status: "down", message: "timeout" }));
    const body = await registry.runReadiness();
    expect(body.status).toBe("degraded");
    expect(body.checks.db?.status).toBe("down");
  });
});
