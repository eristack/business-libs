import type { NextFunction, Request, Response } from "express";
import { BusinessPolicyDeniedError } from "../core/errors.js";
import type { Pbac, PbacInput } from "../core/types.js";

export function createRequireBusinessPolicy(options: {
  pbac: Pbac;
  policyId: string;
  getInput: (req: Request) => PbacInput | Promise<PbacInput>;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = await options.getInput(req);
      await options.pbac.authorize(options.policyId, input);
      next();
    } catch (err) {
      if (err instanceof BusinessPolicyDeniedError) {
        res.status(409).json({
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
