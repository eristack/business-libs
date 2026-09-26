import { Router, type NextFunction, type Request, type Response } from "express";
import type { OAuthConsumer } from "../core/types.js";
import type { OAuthProvider } from "../provider/create-oauth-provider.js";
import {
  createRestOAuthConsumerActions,
  createRestOAuthProviderActions,
  toOAuthErrorResponse,
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
  if (result.status === 302 && result.headers?.location) {
    res.redirect(result.status, result.headers.location);
    return;
  }
  if (result.status === 204 || result.body === null) {
    res.status(result.status).end();
    return;
  }
  res.status(result.status).json(result.body);
}

/**
 * Consumer routes: GET `/oauth/:provider/login`, GET `/oauth/:provider/callback`.
 * After callback JSON, call jwt-auth.issueTokens in your handler or use `onCallback`.
 */
export function createOAuthConsumerRouter(options: {
  consumer: OAuthConsumer;
  onCallback?: (
    result: Awaited<ReturnType<OAuthConsumer["completeLogin"]>>,
    req: Request,
    res: Response,
  ) => void | Promise<void>;
}): Router {
  const actions = createRestOAuthConsumerActions({ consumer: options.consumer });
  const router = Router();

  router.get("/:provider/login", async (req, res, next) => {
    try {
      const result = await actions.beginLogin(toRestRequest(req));
      if (result.status === 302) {
        sendRest(res, result);
        return;
      }
      sendRest(res, result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:provider/callback", async (req, res, next) => {
    try {
      const result = await actions.callback(toRestRequest(req));
      if (result.status !== 200 || !options.onCallback) {
        sendRest(res, result);
        return;
      }
      await options.onCallback(result.body as Awaited<ReturnType<OAuthConsumer["completeLogin"]>>, req, res);
    } catch (err) {
      next(err);
    }
  });

  router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    sendRest(res, toOAuthErrorResponse(err));
  });

  return router;
}

/** Provider routes: POST `/oauth/token`, optional GET `/oauth/dev/authorize` (disable in prod). */
export function createOAuthProviderRouter(options: {
  provider: OAuthProvider;
  enableDevAuthorize?: boolean;
}): Router {
  const actions = createRestOAuthProviderActions({ provider: options.provider });
  const router = Router();

  router.post("/token", async (req, res, next) => {
    try {
      sendRest(res, await actions.token(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  if (options.enableDevAuthorize) {
    router.get("/dev/authorize", async (req, res, next) => {
      try {
        sendRest(res, await actions.devAuthorize(toRestRequest(req)));
      } catch (err) {
        next(err);
      }
    });
  }

  router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    sendRest(res, toOAuthErrorResponse(err));
  });

  return router;
}
