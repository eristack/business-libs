import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createDataGrid } from "../core/create-data-grid.js";
import type { DataGridQuery, DataGridSchema } from "../core/types.js";
import {
  parseDataGridFromRequest,
  toDataGridErrorResponse,
  type RestRequest,
  type RestResponse,
} from "../rest/index.js";

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
      get: (name) => req.header(name) ?? null,
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

declare global {
  namespace Express {
    interface Request {
      dataGridQuery?: DataGridQuery;
    }
  }
}

/** Headless middleware: parses & attaches `req.dataGridQuery`. */
export function createDataGridMiddleware(schema: DataGridSchema): RequestHandler {
  const grid = createDataGrid(schema);
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.dataGridQuery = grid.parse(flattenQuery(req.query));
      next();
    } catch (error) {
      applyRestResponse(res, toDataGridErrorResponse(error));
    }
  };
}

export function parseDataGridExpressQuery(
  req: Request,
  schema: DataGridSchema,
): DataGridQuery {
  return parseDataGridFromRequest(toRestRequest(req), schema);
}

export {
  parseDataGridFromRequest,
  createDataGridListAction,
  toDataGridBody,
  toDataGridErrorResponse,
} from "../rest/index.js";
