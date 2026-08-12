import type { NextFunction, Request, Response } from "express";
import { PolicyDeniedError } from "../core/errors.js";
import type { Abac, AbacContext } from "../core/types.js";

export type AbacRequest = Request & {
  subject?: string;
  auth?: { subject?: string; attrs?: Record<string, unknown> };
};

export function createRequirePolicy(options: {
  abac: Abac;
  policyId: string;
  getContext: (req: AbacRequest) => AbacContext | Promise<AbacContext>;
}) {
  return async (req: AbacRequest, res: Response, next: NextFunction) => {
    try {
      const ctx = await options.getContext(req);
      await options.abac.authorize(options.policyId, ctx);
      next();
    } catch (err) {
      if (err instanceof PolicyDeniedError) {
        res.status(403).json({
          error: {
            code: err.code,
            message: err.message,
            policyId: err.policyId,
            reason: err.reason,
          },
        });
        return;
      }
      next(err);
    }
  };
}
