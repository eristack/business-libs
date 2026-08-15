import { Router, type NextFunction, type Request, type Response } from "express";
import type { Epoch } from "../core/types.js";
import {
  createRestEpochActions,
  toEpochErrorResponse,
  type RestRequest,
} from "../rest/index.js";

export type EpochRequest = Request;

export function toRestRequest(req: Request): RestRequest {
  return {
    method: req.method,
    headers: {
      get(name: string) {
        const value = req.headers[name.toLowerCase()];
        if (Array.isArray(value)) return value[0] ?? null;
        return value ?? null;
      },
    },
    body: req.body,
    params: req.params as Record<string, string | undefined>,
    query: req.query as Record<string, string | string[] | undefined>,
  };
}

function sendRest(
  res: Response,
  result: { status: number; body: unknown; headers?: Record<string, string> },
) {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(result.status).json(result.body);
}

/** Mount on `/epoch` (or your prefix). Routes: GET `/:scope`, POST `/:scope/bump`, GET `/:scope/cache-policy`. */
export function createEpochRouter(options: { epoch: Epoch }): Router {
  const actions = createRestEpochActions({ epoch: options.epoch });
  const router = Router();

  router.get("/:scope", async (req, res, next) => {
    try {
      sendRest(res, await actions.getCurrent(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post("/:scope/bump", async (req, res, next) => {
    try {
      sendRest(res, await actions.bump(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:scope/cache-policy", async (req, res, next) => {
    try {
      sendRest(res, await actions.resolveCachePolicy(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.use(
    (err: unknown, _req: EpochRequest, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        next(err);
        return;
      }
      sendRest(res, toEpochErrorResponse(err));
    },
  );

  return router;
}
