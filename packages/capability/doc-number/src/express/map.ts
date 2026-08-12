import type { Request, Response } from "express";
import type { RestRequest, RestResponse } from "../rest/index.js";

function flattenQuery(
  query: Request["query"],
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" || Array.isArray(value)) {
      out[key] = value as string | string[];
    } else if (value == null) {
      out[key] = undefined;
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

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
    body: req.body,
    params,
    query: flattenQuery(req.query),
  };
}

export function applyRestResponse(res: Response, result: RestResponse): void {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(result.status).json(result.body);
}
