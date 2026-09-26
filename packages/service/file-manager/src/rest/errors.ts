import {
  FileManagerError,
  FileNotFoundError,
  FileNotReadyError,
  InvalidFileInputError,
  StorageObjectMissingError,
} from "../core/errors.js";
import type { RestResponse } from "./types.js";

export function toFileManagerErrorResponse(err: unknown): RestResponse {
  if (err instanceof FileNotFoundError) {
    return { status: 404, body: { code: err.code, message: err.message } };
  }
  if (err instanceof FileNotReadyError) {
    return { status: 409, body: { code: err.code, message: err.message } };
  }
  if (err instanceof InvalidFileInputError) {
    return { status: 400, body: { code: err.code, message: err.message } };
  }
  if (err instanceof StorageObjectMissingError) {
    return { status: 409, body: { code: err.code, message: err.message } };
  }
  if (err instanceof FileManagerError) {
    return { status: 400, body: { code: err.code, message: err.message } };
  }
  return {
    status: 500,
    body: { code: "INTERNAL_ERROR", message: "Unexpected file manager error" },
  };
}
