import {
  toOpenApiDocument,
  type OpenApiDocument,
  type OpenApiEmitOptions,
} from "@eristack/rest";
import { openApiPolicyRegistryExtensions } from "@eristack/pbac";
import type { PolicyRegistryOpenApi } from "@eristack/pbac";
import {
  createDocumentRoutes,
  type CreateDocumentRoutesOptions,
} from "../core/document-routes.js";

const STUB = async (): Promise<{ status: number }> => ({ status: 501 });

export type DocumentOpenApiOptions = {
  basePath: string;
  tags?: string[];
  info?: OpenApiEmitOptions;
  /** PBAC registry extensions merged onto the document root. */
  policyRegistry?: PolicyRegistryOpenApi;
};

/** OpenAPI 3.1 for the opinionated document REST map (stub handlers). */
export function documentRoutesOpenApiDocument(
  options: DocumentOpenApiOptions,
): OpenApiDocument & Record<string, unknown> {
  const handlers = {
    options: STUB,
    list: STUB,
    read: STUB,
    create: STUB,
    replace: STUB,
    transition: STUB,
    delete: STUB,
  } satisfies CreateDocumentRoutesOptions["handlers"];

  const routes = createDocumentRoutes({
    basePath: options.basePath,
    tags: options.tags,
    handlers,
  });

  const doc = toOpenApiDocument(routes, {
    title: options.info?.title ?? "Document API",
    version: options.info?.version ?? "0.0.0",
  });

  if (!options.policyRegistry) return doc;

  return {
    ...doc,
    ...openApiPolicyRegistryExtensions(options.policyRegistry),
  };
}
