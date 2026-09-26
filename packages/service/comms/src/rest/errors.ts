import { CommsError } from "../core/errors.js";
import type { RestResponse } from "./types.js";

export function toCommsErrorResponse(err: unknown): RestResponse {
  if (err instanceof CommsError) {
    const status =
      err.code === "MESSAGE_NOT_FOUND"
        ? 404
        : err.code === "IDEMPOTENCY_CONFLICT"
          ? 409
          : err.code === "WEBHOOK_VERIFICATION_FAILED"
            ? 401
            : 400;
    return { status, body: { code: err.code, message: err.message } };
  }
  return {
    status: 500,
    body: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
  };
}
