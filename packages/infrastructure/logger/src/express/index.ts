import type { NextFunction, Request, Response } from "express";
import {
  createLogger,
  createRequestId,
  type Logger,
  type LogContext,
} from "../core/create-logger.js";
import { LOGGER_REQUEST_KEY, type RequestLoggerHolder } from "../core/types.js";

export type ExpressLoggerOptions = {
  logger?: Logger;
  /** Header to read incoming request id (default `x-request-id`). */
  requestIdHeader?: string;
  resolveContext?: (req: Request) => LogContext;
};

export type ExpressRequest = Request & RequestLoggerHolder;

function readHeader(req: Request, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Attach request-scoped logger and emit request start/finish JSON lines. */
export function createLoggerMiddleware(options: ExpressLoggerOptions = {}) {
  const header = options.requestIdHeader ?? "x-request-id";
  const root = options.logger ?? createLogger({ name: "http" });

  return (req: ExpressRequest, res: Response, next: NextFunction) => {
    const requestId = readHeader(req, header) ?? createRequestId();
    const extra = options.resolveContext?.(req) ?? {};
    const log = root.child({ requestId, ...extra });
    req[LOGGER_REQUEST_KEY] = log;
    req.requestId = requestId;
    res.setHeader(header, requestId);

    const started = Date.now();
    log.info("request.start", {
      method: req.method,
      path: req.originalUrl ?? req.url,
    });

    res.on("finish", () => {
      log.info("request.finish", {
        method: req.method,
        path: req.originalUrl ?? req.url,
        status: res.statusCode,
        durationMs: Date.now() - started,
      });
    });

    next();
  };
}

export function getRequestLogger(req: ExpressRequest): Logger | undefined {
  return req[LOGGER_REQUEST_KEY];
}
