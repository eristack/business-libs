import { Router, type NextFunction, type Request, type Response } from "express";
import type { CommsHub } from "../core/types.js";
import { createRestCommsActions, toCommsErrorResponse, type RestRequest } from "../rest/index.js";

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

/**
 * POST `/send`, GET `/messages/:id`, POST `/webhooks/:vendor`.
 * For Twilio webhooks set header `x-twilio-webhook-url` to the public URL Twilio signed.
 */
export function createCommsRouter(options: { hub: CommsHub }): Router {
  const actions = createRestCommsActions({ hub: options.hub });
  const router = Router();

  router.post("/send", async (req, res, next) => {
    try {
      sendRest(res, await actions.send(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/messages/:id", async (req, res, next) => {
    try {
      sendRest(res, await actions.getMessage(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post("/webhooks/:vendor", async (req, res, next) => {
    try {
      sendRest(res, await actions.webhook(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    sendRest(res, toCommsErrorResponse(err));
  });

  return router;
}
