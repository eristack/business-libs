import type { BackseatResponse } from "./types.js";

/** Conventional HTTP error codes aligned with Express adapters (apps may add domain codes). */
export const BackseatErrorCodes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  FORBIDDEN_PERMISSION: "FORBIDDEN_PERMISSION",
  FORBIDDEN_SCOPE: "FORBIDDEN_SCOPE",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT_VERSION: "CONFLICT_VERSION",
  POLICY_DENIED: "POLICY_DENIED",
  BUSINESS_POLICY_DENIED: "BUSINESS_POLICY_DENIED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type BackseatErrorCode =
  (typeof BackseatErrorCodes)[keyof typeof BackseatErrorCodes] | string;

export type JsonErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type JsonErrorInput = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * Standard error envelope for Backseat handlers — same shape as Express/PBAC 409 responses.
 * Return from handlers or throw {@link BackseatError} subclasses caught by `handle()`.
 */
export function jsonError(input: JsonErrorInput): BackseatResponse<JsonErrorBody> {
  return {
    status: input.status,
    headers: { "Content-Type": "application/json" },
    body: {
      error: {
        code: input.code,
        message: input.message,
        ...(input.details ? { details: input.details } : {}),
      },
    },
  };
}

export function versionConflict(
  message = "Document version conflict",
  details?: Record<string, unknown>,
): BackseatResponse<JsonErrorBody> {
  return jsonError({
    status: 409,
    code: BackseatErrorCodes.CONFLICT_VERSION,
    message,
    details,
  });
}
