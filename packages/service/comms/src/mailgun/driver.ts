import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createMailgunEmailDriver(options: {
  apiKey: string;
  domain: string;
  defaultFrom: string;
  /** EU: `https://api.eu.mailgun.net` */
  apiBase?: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;
  const base = (options.apiBase ?? "https://api.mailgun.net").replace(/\/$/, "");

  return {
    vendor: "mailgun",
    channels: ["email"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "email") {
        throw new InvalidCommsInputError("Mailgun driver supports email only");
      }
      if (!input.text && !input.html) {
        throw new InvalidCommsInputError("text or html is required for email");
      }

      const body = new URLSearchParams();
      body.set("from", input.from ?? options.defaultFrom);
      body.set("to", input.to);
      body.set("subject", input.subject ?? "(no subject)");
      if (input.text) body.set("text", input.text);
      if (input.html) body.set("html", input.html);

      const auth = Buffer.from(`api:${options.apiKey}`).toString("base64");
      const res = await postJson(`${base}/v3/${options.domain}/messages`, {
        method: "POST",
        fetch: fetchFn,
        headers: {
          authorization: `Basic ${auth}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const json = await readJsonOrThrow(res, "Mailgun");
      const messageId =
        typeof json.id === "string" ? json.id : `mailgun_${input.idempotencyKey}`;
      return { providerMessageId: messageId, status: "sent" };
    },
  };
}
