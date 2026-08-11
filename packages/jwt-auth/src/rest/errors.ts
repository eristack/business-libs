import {
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  JwtAuthError,
  RefreshTokenReuseError,
  SessionNotFoundError,
  UsernameTakenError,
} from "../core/errors.js";
import type { RestErrorBody, RestResponse } from "./types.js";

export function toErrorResponse(error: unknown): RestResponse<RestErrorBody> {
  if (error instanceof RefreshTokenReuseError) {
    return {
      status: 401,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof InvalidRefreshTokenError) {
    return {
      status: 401,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof InvalidAccessTokenError) {
    return {
      status: 401,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof InvalidCredentialsError) {
    return {
      status: 401,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof UsernameTakenError) {
    return {
      status: 409,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof SessionNotFoundError) {
    return {
      status: 404,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof JwtAuthError) {
    return {
      status: 400,
      body: { error: { code: error.code, message: error.message } },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
    },
  };
}
