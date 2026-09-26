import type { RequestHandler } from "express";
import { findPanLikeStringPaths } from "../core/pan-detect.js";

export type RejectRawPanMiddlewareOptions = {
  /** JSON field names allowed to carry PAN-shaped test data (default: none). */
  allowPaths?: string[];
};

/** Reject request bodies that contain raw PAN-like strings before handlers run. */
export function createRejectRawPanMiddleware(
  options: RejectRawPanMiddlewareOptions = {},
): RequestHandler {
  const allow = new Set(options.allowPaths ?? []);
  return (req, res, next) => {
    const hits = findPanLikeStringPaths(req.body).filter((p) => !allow.has(p));
    if (hits.length > 0) {
      res.status(400).json({
        error: {
          code: "INVALID_PAYMENT_INSTRUMENT",
          message: "Raw card numbers must not be sent to the API — use gateway tokenization",
          fields: hits,
        },
      });
      return;
    }
    next();
  };
}
