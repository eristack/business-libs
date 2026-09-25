import {
  Router,
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
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

function resolveDispatchPath(req: Request, base: string): string {
  let path = req.path || "/";
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
}

/**
 * Dispatch middleware — use with `app.use(basePath, middleware)` on **Express 5**
 * (avoids splat `*` mount issues). Unmatched routes call `next()`.
 */
export function createExpressRestMiddleware(
  options: CreateExpressRestRouterOptions,
): RequestHandler {
  const base = options.basePath?.replace(/\/$/, "") ?? "";

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = resolveDispatchPath(req, base);

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
  };
}

/** Mount on an Express app (Express 4 or 5). */
export function mountExpressRest(
  app: Express,
  options: CreateExpressRestRouterOptions & { mountPath?: string },
): void {
  const mountPath = options.mountPath ?? options.basePath ?? "/";
  app.use(mountPath, createExpressRestMiddleware(options));
}

/** Mount declarative REST routes on an Express Router (Express 4 splat). */
export function createExpressRestRouter(
  options: CreateExpressRestRouterOptions,
): Router {
  const expressRouter = Router();
  expressRouter.use(createExpressRestMiddleware(options));
  return expressRouter;
}
