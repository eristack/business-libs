import { OAuthError } from "../core/errors.js";
import type { RestResponse } from "./types.js";

export function toOAuthErrorResponse(err: unknown): RestResponse {
  if (err instanceof OAuthError) {
    const status =
      err.code === "OAUTH_STATE_INVALID" || err.code === "INVALID_REDIRECT_URI"
        ? 400
        : err.code.startsWith("INVALID_") || err.code === "UNKNOWN_OAUTH_PROVIDER"
          ? 400
          : 502;
    return { status, body: { code: err.code, message: err.message } };
  }
  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Unknown error",
    },
  };
}
