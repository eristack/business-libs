import { describe, expect, it } from "vitest";
import { createSendGridEmailDriver } from "../src/sendgrid/driver.js";

describe("createSendGridEmailDriver", () => {
  it("returns sent on 202", async () => {
    const driver = createSendGridEmailDriver({
      apiKey: "SG.test",
      defaultFrom: "noreply@example.com",
      fetch: async () =>
        new Response(null, { status: 202, headers: { "x-message-id": "sg-abc" } }),
    });

    const result = await driver.send({
      channel: "email",
      idempotencyKey: "idem-1",
      to: "user@example.com",
      subject: "Test",
      text: "Body",
    });
    expect(result.providerMessageId).toBe("sg-abc");
    expect(result.status).toBe("sent");
  });
});
