import type { NextFunction, Request, Response } from "express";
import {
  defaultInternalErrorEnvelope,
  resolveDomainError,
  type MapDomainErrorOptions,
} from "./domain-error-map.js";

export {
  resolveDomainError,
  defaultInternalErrorEnvelope,
  type DomainErrorEnvelope,
  type DomainErrorMapping,
  type MapDomainErrorOptions,
} from "./domain-error-map.js";

function sendEnvelope(
  res: Response,
  status: number,
  body: { error: Record<string, unknown> },
  headers?: Record<string, string>,
) {
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(status).json(body);
  return res;
}

/**
 * Express error mapper — same JSON envelope as Backseat handlers.
 * Returns true when a response was sent (including fallback 500).
 */
export function createMapDomainError(options?: MapDomainErrorOptions) {
  return (error: unknown, res: Response): boolean => {
    const mapped =
      resolveDomainError(error, options) ??
      defaultInternalErrorEnvelope(error);
    sendEnvelope(res, mapped.status, mapped.body, mapped.headers);
    return true;
  };
}

/** Wrap async route handlers; maps domain errors when headers are not sent yet. */
export function createAsyncHandler(options?: MapDomainErrorOptions) {
  const mapDomainError = createMapDomainError(options);
  return (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((err: unknown) => {
        if (res.headersSent) {
          next(err);
          return;
        }
        mapDomainError(err, res);
      });
    };
  };
}
