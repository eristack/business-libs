import {
  InvalidOperatorError,
  InvalidQueryError,
} from "../core/errors.js";
import { createDataGrid } from "../core/create-data-grid.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
  PageInfo,
} from "../core/types.js";

export type RestRequest = {
  method?: string;
  headers?: { get(name: string): string | null };
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type RestResponse<T = unknown> = {
  status: number;
  body: T;
  headers?: Record<string, string>;
};

export type RestErrorBody = {
  error: { code: string; message: string };
};

export type DataGridBody<T> = {
  items: T[];
  pageInfo: PageInfo;
  query: DataGridQuery;
};

export function toDataGridBody<T>(result: DataGridResult<T>): DataGridBody<T> {
  return {
    items: result.items,
    pageInfo: result.pageInfo,
    query: result.query,
  };
}

export function parseDataGridFromRequest(
  req: RestRequest,
  schema: DataGridSchema,
): DataGridQuery {
  const grid = createDataGrid(schema);
  return grid.parse(req.query as DataGridQueryInput);
}

export function toDataGridErrorResponse(error: unknown): RestResponse<RestErrorBody> {
  if (error instanceof InvalidQueryError || error instanceof InvalidOperatorError) {
    return {
      status: 400,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
    },
  };
}

/**
 * Helper factory: parse query from request, run loader, return grid body.
 * Apps inject the loader (store/core) — headless, no framework.
 */
export function createDataGridListAction<T>(options: {
  schema: DataGridSchema;
  load: (query: DataGridQuery, req: RestRequest) => Promise<DataGridResult<T>>;
}) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<DataGridBody<T> | RestErrorBody>> => {
    try {
      const query = parseDataGridFromRequest(req, options.schema);
      const result = await options.load(query, req);
      return { status: 200, body: toDataGridBody(result) };
    } catch (error) {
      return toDataGridErrorResponse(error);
    }
  };
}
