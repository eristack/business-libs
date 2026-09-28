import type { Request, RequestHandler, Response } from "express";
import { IdempotencyConflictError, IdempotencyRequestMismatchError } from "../core/errors.js";
import { hashIdempotencyRequest } from "../core/request-hash.js";
import type { IdempotencyGuard, IdempotencyScope } from "../core/types.js";

export type IdempotencyRouteOptions = {
  guard: IdempotencyGuard;
  header?: string;
  scopeFromReq?: (req: Request) => IdempotencyScope;
};

/**
 * Wrap a JSON route handler so `Idempotency-Key` replays the stored response.
 * Use on POST routes after api-key and rate-limit.
 */
export function wrapIdempotentHandler<T>(
  options: IdempotencyRouteOptions,
  handler: (req: Request, res: Response) => Promise<T>,
): RequestHandler {
  const header = options.header ?? "Idempotency-Key";
  const scopeFromReq =
    options.scopeFromReq ??
    ((req) => ({ scope: `${req.method} ${req.baseUrl}${req.path}` }));

  return async (req, res, next) => {
    const rawKey = req.header(header)?.trim();
    if (!rawKey) {
      try {
        const body = await handler(req, res);
        if (!res.headersSent) res.status(200).json(body);
      } catch (err) {
        next(err);
      }
      return;
    }

    try {
      const requestHash = await hashIdempotencyRequest(req.body);
      const body = await options.guard.runScoped({
        scope: scopeFromReq(req),
        key: rawKey,
        requestHash,
        fn: () => handler(req, res),
      });
      if (!res.headersSent) res.status(200).json(body);
    } catch (err) {
      if (err instanceof IdempotencyConflictError) {
        res.status(409).setHeader("Retry-After", "1").json({
          error: err.code,
          message: err.message,
          key: err.key,
        });
        return;
      }
      if (err instanceof IdempotencyRequestMismatchError) {
        res.status(409).json({
          error: err.code,
          message: err.message,
          key: err.key,
        });
        return;
      }
      next(err);
    }
  };
}
