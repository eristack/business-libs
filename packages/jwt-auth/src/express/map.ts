import type { Request, Response } from "express";
import {
  serializeClearCookie,
  serializeSetCookie,
  type RestRequest,
  type RestResponse,
} from "../rest/index.js";

export function toRestRequest(
  req: Request,
  params?: Record<string, string | undefined>,
): RestRequest {
  return {
    method: req.method,
    headers: {
      get: (name) => {
        const value = req.header(name);
        return value ?? null;
      },
    },
    cookies: {
      get: (name) => {
        const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
        return cookies?.[name];
      },
    },
    body: req.body,
    params,
  };
}

export function applyRestResponse(res: Response, result: RestResponse): void {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  if (result.cookies) {
    for (const cookie of result.cookies) {
      res.append("Set-Cookie", serializeSetCookie(cookie));
    }
  }

  if (result.clearCookies) {
    for (const name of result.clearCookies) {
      res.append("Set-Cookie", serializeClearCookie(name));
    }
  }

  res.status(result.status).json(result.body);
}
