import { InvalidCommsInputError } from "../core/errors.js";
import type { CommsDriver, SendCommsDriverInput } from "../core/types.js";
import { postJson, readJsonOrThrow } from "../drivers/fetch-json.js";

export function createPostmarkEmailDriver(options: {
  serverToken: string;
  defaultFrom: string;
  fetch?: typeof fetch;
}): CommsDriver {
  const fetchFn = options.fetch ?? fetch;

  return {
    vendor: "postmark",
    channels: ["email"],
    async send(input: SendCommsDriverInput) {
      if (input.channel !== "email") {
        throw new InvalidCommsInputError("Postmark driver supports email only");
      }
      if (!input.text && !input.html) {
        throw new InvalidCommsInputError("text or html is required for email");
      }

      const res = await postJson("https://api.postmarkapp.com/email", {
        method: "POST",
        fetch: fetchFn,
        headers: {
          "x-postmark-server-token": options.serverToken,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          From: input.from ?? options.defaultFrom,
          To: input.to,
          Subject: input.subject ?? "(no subject)",
          TextBody: input.text,
          HtmlBody: input.html,
          MessageStream: "outbound",
        }),
      });

      const json = await readJsonOrThrow(res, "Postmark");
      const messageId =
        typeof json.MessageID === "string"
          ? json.MessageID
          : typeof json.MessageId === "string"
            ? json.MessageId
            : `postmark_${input.idempotencyKey}`;

      return { providerMessageId: messageId, status: "sent" };
    },
  };
}
