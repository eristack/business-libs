import { describe, expect, it } from "vitest";
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createPbac, documents } from "../src/index.js";
import { registerPbacBackseat } from "../src/backseat/register.js";

describe("pbac backseat authorize errors", () => {
  it("returns BUSINESS_POLICY_DENIED JSON on illegal transition", async () => {
    const api = createBackseat({
      store: createMemoryBackseatStore(),
      baseUrl: "/api",
    });
    const pbac = createPbac();
    pbac.registerPolicy({
      id: "order.submit",
      evaluate: documents.transitions("status", {
        draft: ["submit"],
        submitted: [],
      }),
    });
    registerPbacBackseat(api, { pbac });

    const res = await api.handle({
      method: "POST",
      path: "/api/pbac/authorize/order.submit",
      body: { document: { status: "submitted" }, action: "submit" },
    });

    expect(res.status).toBe(409);
    expect((res.body as { error: { code: string; policyId: string } }).error.code).toBe(
      "BUSINESS_POLICY_DENIED",
    );
    expect((res.body as { error: { policyId: string } }).error.policyId).toBe(
      "order.submit",
    );
  });
});
