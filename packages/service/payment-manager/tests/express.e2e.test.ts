import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestPaymentManagerApp } from "./helpers.js";

describe("express payment-manager E2E", () => {
  it("create → get → webhook → cancel flow", async () => {
    const { app } = createTestPaymentManagerApp();

    const created = await request(app)
      .post("/payments/intents")
      .send({
        gateway: "memory",
        idempotencyKey: "e2e-1",
        amount: { currency: "USD", amount: "42.00" },
        ownerId: "user-1",
      });

    expect(created.status).toBe(201);
    const intent = created.body as {
      id: string;
      gatewayIntentId?: string;
      status: string;
    };
    expect(intent.status).toBe("processing");

    const fetched = await request(app).get(`/payments/intents/${intent.id}`);
    expect(fetched.status).toBe(200);

    const webhook = await request(app)
      .post("/payments/webhooks/memory")
      .send({
        type: "payment.succeeded",
        id: "evt_e2e",
        gatewayIntentId: intent.gatewayIntentId,
        status: "succeeded",
      });
    expect(webhook.status).toBe(200);

    const after = await request(app).get(`/payments/intents/${intent.id}`);
    expect((after.body as { status: string }).status).toBe("succeeded");

    const canceled = await request(app).post(`/payments/intents/${intent.id}/cancel`);
    expect(canceled.status).toBe(409);
  });

  it("lists intents by owner", async () => {
    const { app } = createTestPaymentManagerApp();
    await request(app)
      .post("/payments/intents")
      .send({
        gateway: "memory",
        idempotencyKey: "list-1",
        amount: { currency: "USD", amount: "1.00" },
        ownerId: "owner-a",
      });

    const list = await request(app).get("/payments/intents?ownerId=owner-a");
    expect(list.status).toBe(200);
    expect((list.body as { items: unknown[] }).items).toHaveLength(1);
  });
});
