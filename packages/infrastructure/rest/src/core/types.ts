export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RestHandlerContext = {
  method: HttpMethod;
  path: string;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
};

export type RestResponse = {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
};

export type RestHandler = (
  ctx: RestHandlerContext,
) => RestResponse | Promise<RestResponse>;

export type RestRouteDef = {
  method: HttpMethod;
  /** Express-style path, e.g. `/orders/:id`. */
  path: string;
  handler: RestHandler;
  summary?: string;
  tags?: string[];
};

export type RestDispatchResult =
  | { matched: true; response: RestResponse }
  | { matched: false };

export type RestRouter = {
  readonly routes: readonly RestRouteDef[];
  dispatch(input: {
    method: string;
    path: string;
    query?: Record<string, string | string[] | undefined>;
    body?: unknown;
    headers?: Record<string, string | string[] | undefined>;
  }): Promise<RestDispatchResult>;
};

export type OpenApiDocument = {
  openapi: "3.1.0";
  info: { title: string; version: string };
  paths: Record<
    string,
    Partial<
      Record<
        Lowercase<HttpMethod>,
        { summary?: string; tags?: string[]; operationId?: string }
      >
    >
  >;
};
