import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createSendGridEmailDriver(options: {
  apiKey: string;
  defaultFrom: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;

  return {
    vendor: "sendgrid",
    channels: ["email"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "email") {
        throw new InvalidCommsInputError("SendGrid driver supports email only");
      }
      if (!input.text && !input.html) {
        throw new InvalidCommsInputError("text or html is required for email");
      }

      const from = input.from ?? options.defaultFrom;
      const res = await postJson("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        fetch: fetchFn,
        headers: {
          authorization: `Bearer ${options.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: { email: from },
          subject: input.subject ?? "(no subject)",
          content: [
            ...(input.text ? [{ type: "text/plain", value: input.text }] : []),
            ...(input.html ? [{ type: "text/html", value: input.html }] : []),
          ],
        }),
      });

      if (res.status === 202) {
        const messageId = res.headers.get("x-message-id") ?? `sendgrid_${input.idempotencyKey}`;
        return { providerMessageId: messageId, status: "sent" };
      }

      await readJsonOrThrow(res, "SendGrid");
      return { providerMessageId: `sendgrid_${input.idempotencyKey}`, status: "sent" };
    },
    async parseWebhook({ rawBody }) {
      const body = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
      const events = Array.isArray(body) ? body : [body];
      return events.map((evt: Record<string, unknown>) => ({
        eventType: String(evt.event ?? "sendgrid.event"),
        providerEventId: typeof evt.sg_event_id === "string" ? evt.sg_event_id : undefined,
        providerMessageId: typeof evt.sg_message_id === "string" ? evt.sg_message_id : undefined,
        status: mapSendGridEvent(String(evt.event ?? "")),
        raw: evt,
      }));
    },
  };
}

function mapSendGridEvent(event: string) {
  if (event === "delivered") return "delivered" as const;
  if (event === "bounce" || event === "dropped") return "bounced" as const;
  if (event === "deferred" || event === "processed") return "sent" as const;
  return undefined;
}
