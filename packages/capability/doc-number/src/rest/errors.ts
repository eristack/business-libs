import {
  DocNumberError,
  FormatNotFoundError,
  InvalidPatternError,
  MissingDependencyError,
  ParseMismatchError,
} from "../core/errors.js";
import type { RestErrorBody, RestResponse } from "./types.js";

export function toErrorResponse(error: unknown): RestResponse<RestErrorBody> {
  if (error instanceof FormatNotFoundError) {
    return {
      status: 404,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof InvalidPatternError || error instanceof ParseMismatchError) {
    return {
      status: 400,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof MissingDependencyError) {
    return {
      status: 500,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof DocNumberError) {
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
