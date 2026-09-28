import { describe, expect, it } from "vitest";
import { createResendEmailDriver } from "../src/resend/driver.js";

describe("createResendEmailDriver", () => {
  it("returns provider id from Resend JSON", async () => {
    const driver = createResendEmailDriver({
      apiKey: "re_test",
      defaultFrom: "Acme <noreply@example.com>",
      fetch: async () =>
        new Response(JSON.stringify({ id: "4ef6323f-0076-4a97-b34f-0d5a2089b726" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });

    const result = await driver.send({
      channel: "email",
      idempotencyKey: "idem-1",
      to: "user@example.com",
      subject: "Test",
      html: "<p>Body</p>",
    });
    expect(result.providerMessageId).toBe("4ef6323f-0076-4a97-b34f-0d5a2089b726");
    expect(result.status).toBe("sent");
  });

  it("parseWebhook maps delivered events", async () => {
    const driver = createResendEmailDriver({
      apiKey: "re_test",
      defaultFrom: "noreply@example.com",
    });
    const events = await driver.parseWebhook?.({
      rawBody: JSON.stringify({
        type: "email.delivered",
        data: { email_id: "4ef6323f-0076-4a97-b34f-0d5a2089b726" },
      }),
      headers: {},
    });
    expect(events?.[0]?.status).toBe("delivered");
    expect(events?.[0]?.providerMessageId).toBe("4ef6323f-0076-4a97-b34f-0d5a2089b726");
  });
});
