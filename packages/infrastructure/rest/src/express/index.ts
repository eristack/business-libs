import { Router, type NextFunction, type Request, type Response } from "express";
import type { RestRouter } from "../core/types.js";

export type CreateExpressRestRouterOptions = {
  router: RestRouter;
  /** When set, only paths under this prefix are handled (prefix stripped before dispatch). */
  basePath?: string;
};

function sendResponse(res: Response, result: { status: number; body?: unknown; headers?: Record<string, string> }) {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }
  if (result.body === undefined) {
    res.sendStatus(result.status);
    return;
  }
  res.status(result.status).json(result.body);
}

/** Mount declarative REST routes on an Express Router. */
export function createExpressRestRouter(
  options: CreateExpressRestRouterOptions,
): Router {
  const expressRouter = Router();
  const base = options.basePath?.replace(/\/$/, "") ?? "";

  expressRouter.all("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let path = req.path;
      if (base && path.startsWith(base)) {
        path = path.slice(base.length) || "/";
      }

      const result = await options.router.dispatch({
        method: req.method,
        path,
        query: req.query as Record<string, string | string[] | undefined>,
        body: req.body,
        headers: req.headers as Record<string, string | string[] | undefined>,
      });

      if (!result.matched) {
        next();
        return;
      }

      sendResponse(res, result.response);
    } catch (error) {
      next(error);
    }
  });

  return expressRouter;
}
