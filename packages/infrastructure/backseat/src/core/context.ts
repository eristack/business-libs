import type { Backseat, BackseatRequest } from "./types.js";

export function queryParam(
  req: BackseatRequest,
  name: string,
): string | undefined {
  const value = req.query?.[name];
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function queryParams(
  req: BackseatRequest,
  name: string,
): string[] {
  const value = req.query?.[name];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseJsonBody<T = unknown>(body: unknown): T {
  if (body === undefined || body === null) {
    return {} as T;
  }
  if (typeof body === "string") {
    return body.length > 0 ? (JSON.parse(body) as T) : ({} as T);
  }
  return body as T;
}

export function createHandlerContext(
  backseat: Backseat,
  req: BackseatRequest,
  params: Record<string, string>,
) {
  return {
    req,
    params,
    store: backseat.store,
    backseat,
    query: (name: string) => queryParam(req, name),
    queryAll: (name: string) => queryParams(req, name),
    json<T = unknown>() {
      return parseJsonBody<T>(req.body);
    },
  };
}

export type BackseatHandlerContext = ReturnType<typeof createHandlerContext>;
