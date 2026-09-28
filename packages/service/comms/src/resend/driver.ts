import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createResendEmailDriver(options: {
  apiKey: string;
  defaultFrom: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;

  return {
    vendor: "resend",
    channels: ["email"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "email") {
        throw new InvalidCommsInputError("Resend driver supports email only");
      }
      if (!input.text && !input.html) {
        throw new InvalidCommsInputError("text or html is required for email");
      }

      const res = await postJson("https://api.resend.com/emails", {
        method: "POST",
        fetch: fetchFn,
        headers: {
          authorization: `Bearer ${options.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: input.from ?? options.defaultFrom,
          to: [input.to],
          subject: input.subject ?? "(no subject)",
          ...(input.text ? { text: input.text } : {}),
          ...(input.html ? { html: input.html } : {}),
        }),
      });

      const json = await readJsonOrThrow(res, "Resend");
      const messageId =
        typeof json.id === "string" ? json.id : `resend_${input.idempotencyKey}`;

      return { providerMessageId: messageId, status: "sent" };
    },
    async parseWebhook({ rawBody }) {
      const body =
        typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
      const events = Array.isArray(body) ? body : [body];
      return events.map((evt: Record<string, unknown>) => {
        const data =
          evt.data && typeof evt.data === "object" && !Array.isArray(evt.data)
            ? (evt.data as Record<string, unknown>)
            : undefined;
        const emailId =
          data && typeof data.email_id === "string"
            ? data.email_id
            : typeof evt.id === "string"
              ? evt.id
              : undefined;
        const type = String(evt.type ?? "resend.event");
        return {
          eventType: type,
          providerEventId: typeof evt.id === "string" ? evt.id : undefined,
          providerMessageId: emailId,
          status: mapResendEventType(type),
          raw: evt,
        };
      });
    },
  };
}

function mapResendEventType(type: string) {
  if (type === "email.delivered") return "delivered" as const;
  if (type === "email.bounced" || type === "email.complained") return "bounced" as const;
  if (type.startsWith("email.")) return "sent" as const;
  return undefined;
}
