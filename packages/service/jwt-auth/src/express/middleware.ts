import type { NextFunction, Request, Response } from "express";
import type { JwtAuth } from "../core/types.js";
import { createRequireAuth, type AuthContext } from "../rest/index.js";
import { toRestRequest } from "./map.js";

export type AuthedRequest = Request & { auth?: AuthContext };

export function createExpressRequireAuth(options: { jwtAuth: JwtAuth }) {
  const requireAuth = createRequireAuth(options);

  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const result = await requireAuth(toRestRequest(req));
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    req.auth = result.auth;
    next();
  };
}
