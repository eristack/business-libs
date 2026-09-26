import { Router, type NextFunction, type Request, type Response } from "express";
import type { PaymentManager } from "../core/types.js";
import {
  createRestPaymentManagerActions,
  toPaymentManagerErrorResponse,
  type RestRequest,
} from "../rest/index.js";

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
  if (result.status === 204) {
    res.status(204).end();
    return;
  }
  res.status(result.status).json(result.body);
}

/**
 * Mount on `/payments` (or your prefix).
 * POST `/intents`, GET `/intents`, GET `/intents/:id`, POST `/intents/:id/cancel`, POST `/webhooks/:gateway`.
 * For Stripe, mount raw body parser on the webhook route in production — see docs/security.md.
 */
export function createPaymentManagerRouter(options: {
  paymentManager: PaymentManager;
}): Router {
  const actions = createRestPaymentManagerActions({
    paymentManager: options.paymentManager,
  });
  const router = Router();

  router.post("/intents", async (req, res, next) => {
    try {
      sendRest(res, await actions.createIntent(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/intents", async (req, res, next) => {
    try {
      sendRest(res, await actions.listIntents(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/intents/:id", async (req, res, next) => {
    try {
      sendRest(res, await actions.getIntent(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post("/intents/:id/cancel", async (req, res, next) => {
    try {
      sendRest(res, await actions.cancelIntent(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post("/webhooks/:gateway", async (req, res, next) => {
    try {
      sendRest(res, await actions.handleWebhook(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.use(
    (err: unknown, _req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        next(err);
        return;
      }
      sendRest(res, toPaymentManagerErrorResponse(err));
    },
  );

  return router;
}
