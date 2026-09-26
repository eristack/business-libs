import { Router, type NextFunction, type Request, type Response } from "express";
import type { FileManager } from "../core/types.js";
import {
  createRestFileManagerActions,
  toFileManagerErrorResponse,
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
 * Mount on `/files` (or your prefix).
 * POST `/uploads/presign`, POST `/uploads/complete`, GET `/`, GET `/:id`, GET `/:id/download-url`, DELETE `/:id`.
 */
export function createFileManagerRouter(options: {
  fileManager: FileManager;
  maxPresignBytes?: number;
}): Router {
  const actions = createRestFileManagerActions({
    fileManager: options.fileManager,
    maxPresignBytes: options.maxPresignBytes,
  });
  const router = Router();

  router.post("/uploads/presign", async (req, res, next) => {
    try {
      sendRest(res, await actions.presignUpload(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post("/uploads/complete", async (req, res, next) => {
    try {
      sendRest(res, await actions.completeUpload(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      sendRest(res, await actions.listFiles(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id/download-url", async (req, res, next) => {
    try {
      sendRest(res, await actions.getDownloadUrl(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      sendRest(res, await actions.getFile(toRestRequest(req)));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      sendRest(res, await actions.deleteFile(toRestRequest(req)));
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
      sendRest(res, toFileManagerErrorResponse(err));
    },
  );

  return router;
}
