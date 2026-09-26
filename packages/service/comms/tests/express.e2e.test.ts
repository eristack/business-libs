import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createCommsHub } from "../src/core/create-comms-hub.js";
import { createMemoryCommsDriver } from "../src/core/memory-driver.js";
import { createMemoryCommsStore } from "../src/core/memory-store.js";
import { createCommsRouter } from "../src/express/index.js";

describe("comms express", () => {
  it("POST /send", async () => {
    const hub = createCommsHub({
      store: createMemoryCommsStore(),
      drivers: { memory: createMemoryCommsDriver() },
    });
    const app = express();
    app.use(express.json());
    app.use("/comms", createCommsRouter({ hub }));

    const res = await request(app).post("/comms/send").send({
      channel: "email",
      vendor: "memory",
      idempotencyKey: "e2e-1",
      to: "a@b.com",
      text: "hi",
    });

    expect(res.status).toBe(201);
    expect(res.body.providerMessageId).toMatch(/^memory_msg_/);
  });
});
