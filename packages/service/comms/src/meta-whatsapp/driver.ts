import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, CommsWebhookEvent, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createMetaWhatsAppDriver(options: {
  accessToken: string;
  phoneNumberId: string;
  apiVersion?: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;
  const version = options.apiVersion ?? "v21.0";

  return {
    vendor: "meta_whatsapp",
    channels: ["whatsapp"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "whatsapp") {
        throw new InvalidCommsInputError("Meta driver supports whatsapp only");
      }
      if (!input.text) throw new InvalidCommsInputError("text is required for WhatsApp");

      const to = input.to.replace(/\D/g, "");
      const res = await postJson(
        `https://graph.facebook.com/${version}/${options.phoneNumberId}/messages`,
        {
          method: "POST",
          fetch: fetchFn,
          headers: {
            authorization: `Bearer ${options.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: input.text },
          }),
        },
      );

      const json = await readJsonOrThrow(res, "Meta WhatsApp");
      const messages = Array.isArray(json.messages) ? json.messages : [];
      const first = (messages[0] ?? {}) as Record<string, unknown>;
      const messageId =
        typeof first.id === "string" ? first.id : `meta_wa_${input.idempotencyKey}`;
      return { providerMessageId: messageId, status: "sent" };
    },
    async parseWebhook({ rawBody }) {
      const text = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      const json = JSON.parse(text) as Record<string, unknown>;
      const entries = Array.isArray(json.entry) ? json.entry : [];
      const events: CommsWebhookEvent[] = [];

      for (const entry of entries) {
        const changes = Array.isArray((entry as { changes?: unknown }).changes)
          ? (entry as { changes: unknown[] }).changes
          : [];
        for (const change of changes) {
          const value = (change as { value?: Record<string, unknown> }).value ?? {};
          const statuses = Array.isArray(value.statuses) ? value.statuses : [];
          for (const st of statuses) {
            const row = st as Record<string, unknown>;
            events.push({
              eventType: `meta.whatsapp.${String(row.status ?? "update")}`,
              providerMessageId: typeof row.id === "string" ? row.id : undefined,
              status: mapMetaStatus(String(row.status ?? "")),
              raw: row,
            });
          }
        }
      }
      return events;
    },
  };
}

function mapMetaStatus(status: string) {
  if (status === "delivered" || status === "read") return "delivered" as const;
  if (status === "failed") return "failed" as const;
  if (status === "sent") return "sent" as const;
  return undefined;
}
