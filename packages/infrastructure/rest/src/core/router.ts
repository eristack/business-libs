import { compileRoute, matchPath } from "./match.js";
import type {
  RestDispatchResult,
  RestHandlerContext,
  RestRouteDef,
  RestRouter,
} from "./types.js";

function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/** Build a dispatchable router from declarative route definitions. */
export function createRestRouter(routes: RestRouteDef[]): RestRouter {
  const compiled = routes.map(compileRoute);

  return {
    routes,
    async dispatch(input): Promise<RestDispatchResult> {
      const method = normalizeMethod(input.method);
      const path = normalizePath(input.path);

      for (const route of compiled) {
        if (route.method !== method) continue;
        const params = matchPath(route, path);
        if (!params) continue;

        const ctx: RestHandlerContext = {
          method: route.method,
          path,
          params,
          query: input.query ?? {},
          body: input.body,
          headers: input.headers ?? {},
        };

        const response = await route.handler(ctx);
        return { matched: true, response };
      }

      return { matched: false };
    },
  };
}

export function defineRoutes(routes: RestRouteDef[]): RestRouter {
  return createRestRouter(routes);
}

export { toOpenApiDocument, type OpenApiEmitOptions } from "./openapi.js";
export type {
  HttpMethod,
  OpenApiDocument,
  RestDispatchResult,
  RestHandler,
  RestHandlerContext,
  RestResponse,
  RestRouteDef,
  RestRouter,
} from "./types.js";
