import type { CommsHub, SendCommsInput } from "../core/types.js";
import type { RestRequest, RestResponse } from "./types.js";

function bodyRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

export function createRestCommsActions(config: { hub: CommsHub }) {
  return {
    async send(req: RestRequest): Promise<RestResponse> {
      const b = bodyRecord(req.body);
      const input: SendCommsInput = {
        channel: String(b.channel ?? "") as SendCommsInput["channel"],
        vendor: String(b.vendor ?? ""),
        idempotencyKey: String(b.idempotencyKey ?? b.idempotency_key ?? ""),
        to: String(b.to ?? ""),
        subject: b.subject ? String(b.subject) : undefined,
        text: b.text ? String(b.text) : undefined,
        html: b.html ? String(b.html) : undefined,
        from: b.from ? String(b.from) : undefined,
        metadata:
          b.metadata && typeof b.metadata === "object"
            ? (b.metadata as Record<string, string>)
            : undefined,
      };
      const message = await config.hub.send(input);
      return { status: 201, body: message };
    },
    async getMessage(req: RestRequest): Promise<RestResponse> {
      const id = req.params.id;
      if (!id) return { status: 400, body: { code: "INVALID_INPUT", message: "id required" } };
      return { status: 200, body: await config.hub.getMessage(id) };
    },
    async webhook(req: RestRequest): Promise<RestResponse> {
      const vendor = req.params.vendor;
      if (!vendor) {
        return { status: 400, body: { code: "INVALID_INPUT", message: "vendor required" } };
      }
      const rawBody =
        typeof req.body === "string" || Buffer.isBuffer(req.body)
          ? req.body
          : req.body && typeof req.body === "object"
            ? req.body
            : "";
      const result = await config.hub.handleWebhook({
        vendor,
        rawBody,
        headers: req.headers,
      });
      return { status: 200, body: result };
    },
  };
}
