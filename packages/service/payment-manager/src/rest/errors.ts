import {
  IdempotencyConflictError,
  InvalidPaymentInputError,
  PaymentIntentNotCancelableError,
  PaymentIntentNotFoundError,
  PaymentManagerError,
  UnknownGatewayError,
  WebhookVerificationError,
} from "../core/errors.js";
import type { RestResponse } from "./types.js";

export function toPaymentManagerErrorResponse(err: unknown): RestResponse {
  if (err instanceof PaymentIntentNotFoundError) {
    return { status: 404, body: { code: err.code, message: err.message } };
  }
  if (err instanceof InvalidPaymentInputError) {
    return { status: 400, body: { code: err.code, message: err.message } };
  }
  if (err instanceof UnknownGatewayError) {
    return { status: 400, body: { code: err.code, message: err.message } };
  }
  if (err instanceof IdempotencyConflictError) {
    return { status: 409, body: { code: err.code, message: err.message } };
  }
  if (err instanceof PaymentIntentNotCancelableError) {
    return { status: 409, body: { code: err.code, message: err.message } };
  }
  if (err instanceof WebhookVerificationError) {
    return { status: 401, body: { code: err.code, message: err.message } };
  }
  if (err instanceof PaymentManagerError) {
    return { status: 400, body: { code: err.code, message: err.message } };
  }
  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Unknown error",
    },
  };
}
