import type { OpenApiDocument, RestRouteDef } from "./types.js";

export type OpenApiEmitOptions = {
  title?: string;
  version?: string;
};

/** Minimal OpenAPI 3.1 paths from route metadata (extend for request/response schemas later). */
export function toOpenApiDocument(
  routes: readonly RestRouteDef[],
  options: OpenApiEmitOptions = {},
): OpenApiDocument {
  const paths: OpenApiDocument["paths"] = {};

  for (const route of routes) {
    const pathItem = paths[route.path] ?? {};
    const method = route.method.toLowerCase() as Lowercase<typeof route.method>;
    pathItem[method] = {
      summary: route.summary,
      tags: route.tags,
      operationId: `${method}_${route.path.replace(/[:/]/g, "_")}`,
    };
    paths[route.path] = pathItem;
  }

  return {
    openapi: "3.1.0",
    info: {
      title: options.title ?? "API",
      version: options.version ?? "0.0.0",
    },
    paths,
  };
}
