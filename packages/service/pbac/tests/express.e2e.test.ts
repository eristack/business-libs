import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createPbac, documents } from "../src/index.js";
import { createRequireBusinessPolicy } from "../src/express/index.js";

function createApp() {
  const pbac = createPbac();
  pbac.registerPolicy({
    id: "order.submit",
    evaluate: documents.transitions("status", {
      draft: ["submit"],
      submitted: [],
    }),
  });

  const app = express();
  app.use(express.json());
  app.patch(
    "/orders/:id",
    createRequireBusinessPolicy({
      pbac,
      policyId: "order.submit",
      getInput: (req) => ({
        document: { status: String(req.body.status ?? "draft") },
        action: String(req.body.action ?? "submit"),
      }),
    }),
    (_req, res) => res.json({ ok: true }),
  );
  return app;
}

describe("pbac express 409 envelope", () => {
  it("returns BUSINESS_POLICY_DENIED when transition is illegal", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/orders/1")
      .send({ status: "submitted", action: "submit" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("BUSINESS_POLICY_DENIED");
    expect(res.body.error.policyId).toBe("order.submit");
  });
});
