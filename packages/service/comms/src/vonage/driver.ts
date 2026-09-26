import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createVonageSmsDriver(options: {
  apiKey: string;
  apiSecret: string;
  defaultFrom: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;

  return {
    vendor: "vonage",
    channels: ["sms"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "sms") {
        throw new InvalidCommsInputError("Vonage driver supports sms only");
      }
      if (!input.text) throw new InvalidCommsInputError("text is required for SMS");

      const res = await postJson("https://rest.nexmo.com/sms/json", {
        method: "POST",
        fetch: fetchFn,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          api_key: options.apiKey,
          api_secret: options.apiSecret,
          to: input.to.replace(/^\+/, ""),
          from: input.from ?? options.defaultFrom,
          text: input.text,
        }),
      });

      const json = await readJsonOrThrow(res, "Vonage");
      const messages = Array.isArray(json.messages) ? json.messages : [];
      const first = (messages[0] ?? {}) as Record<string, unknown>;
      const messageId =
        typeof first["message-id"] === "string"
          ? first["message-id"]
          : `vonage_${input.idempotencyKey}`;
      const status = first.status === "0" ? ("sent" as const) : ("failed" as const);
      return { providerMessageId: messageId, status };
    },
  };
}
