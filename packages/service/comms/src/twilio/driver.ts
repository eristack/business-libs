import { createHmac, timingSafeEqual } from "node:crypto";
import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, HeaderBag, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createTwilioDriver(options: {
  accountSid: string;
  authToken: string;
  smsFrom: string;
  whatsappFrom?: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;
  const whatsappFrom = options.whatsappFrom ?? options.smsFrom;

  return {
    vendor: "twilio",
    channels: ["sms", "whatsapp"],
    async send(input: SendCommsDriverInput) {
      if (!input.text) throw new InvalidCommsInputError("text is required for SMS/WhatsApp");
      let to = input.to;
      let from = input.from ?? options.smsFrom;
      if (input.channel === "whatsapp") {
        from = from.startsWith("whatsapp:") ? from : `whatsapp:${whatsappFrom.replace(/^whatsapp:/, "")}`;
        to = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
      }

      const auth = Buffer.from(`${options.accountSid}:${options.authToken}`).toString("base64");
      const body = new URLSearchParams();
      body.set("To", to);
      body.set("From", from);
      body.set("Body", input.text);

      const res = await postJson(
        `https://api.twilio.com/2010-04-01/Accounts/${options.accountSid}/Messages.json`,
        {
          method: "POST",
          fetch: fetchFn,
          headers: {
            authorization: `Basic ${auth}`,
            "content-type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );

      const json = await readJsonOrThrow(res, "Twilio");
      const sid = typeof json.sid === "string" ? json.sid : `twilio_${input.idempotencyKey}`;
      return { providerMessageId: sid, status: "sent" };
    },
    verifyWebhook(input) {
      return verifyTwilioSignature({
        authToken: options.authToken,
        url: input.headers.get("x-twilio-webhook-url") ?? "",
        rawBody: input.rawBody,
        signature: input.headers.get("x-twilio-signature") ?? "",
      });
    },
    async parseWebhook({ rawBody }) {
      const text = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      const params = new URLSearchParams(text);
      const status = params.get("MessageStatus") ?? params.get("SmsStatus") ?? "unknown";
      return [
        {
          eventType: `twilio.${status}`,
          providerMessageId: params.get("MessageSid") ?? undefined,
          status: mapTwilioStatus(status),
          raw: Object.fromEntries(params.entries()),
        },
      ];
    },
  };
}

function mapTwilioStatus(status: string) {
  if (status === "delivered") return "delivered" as const;
  if (status === "failed" || status === "undelivered") return "failed" as const;
  if (status === "sent" || status === "queued") return "sent" as const;
  return undefined;
}

export function verifyTwilioSignature(input: {
  authToken: string;
  url: string;
  rawBody: string | Buffer | Record<string, unknown>;
  signature: string;
}): boolean {
  if (!input.url || !input.signature) return false;
  const body =
    typeof input.rawBody === "string"
      ? input.rawBody
      : Buffer.isBuffer(input.rawBody)
        ? input.rawBody.toString("utf8")
        : new URLSearchParams(input.rawBody as Record<string, string>).toString();
  const params = new URLSearchParams(body);
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  let data = input.url;
  for (const [k, v] of sorted) data += k + v;
  const expected = createHmac("sha1", input.authToken).update(data).digest("base64");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
  } catch {
    return false;
  }
}

/** Set on webhook requests via middleware: `req.headers['x-twilio-webhook-url'] = publicUrl`. */
export type TwilioWebhookHeaderBag = HeaderBag;
