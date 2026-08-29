import {
  toOpenApiDocument,
  type OpenApiDocument,
  type OpenApiEmitOptions,
  type RestRouteDef,
} from "@eristack/rest";

const STUB = async (): Promise<{ status: number }> => ({ status: 501 });

export type DocNumberFormatOpenApiPaths = {
  formats?: string;
  activeFormat?: string;
  formatById?: string;
  preview?: string;
};

/** Declarative format-config routes for OpenAPI emit (handlers are stubs). */
export function docNumberFormatOpenApiRoutes(
  basePath = "/doc-number",
  paths: DocNumberFormatOpenApiPaths = {},
): RestRouteDef[] {
  const prefix = basePath.replace(/\/$/, "") || "";
  const p = {
    formats: paths.formats ?? "/formats",
    activeFormat: paths.activeFormat ?? "/formats/active",
    formatById: paths.formatById ?? "/formats/:id",
    preview: paths.preview ?? "/preview",
  };
  const tag = ["doc-number"];
  return [
    {
      method: "GET",
      path: `${prefix}${p.formats}`,
      handler: STUB,
      summary: "List document number formats",
      tags: tag,
    },
    {
      method: "GET",
      path: `${prefix}${p.activeFormat}`,
      handler: STUB,
      summary: "Get active format for entityKey",
      tags: tag,
    },
    {
      method: "GET",
      path: `${prefix}${p.formatById}`,
      handler: STUB,
      summary: "Get format by id",
      tags: tag,
    },
    {
      method: "POST",
      path: `${prefix}${p.formats}`,
      handler: STUB,
      summary: "Register format",
      tags: tag,
    },
    {
      method: "PATCH",
      path: `${prefix}${p.formatById}`,
      handler: STUB,
      summary: "Update format",
      tags: tag,
    },
    {
      method: "POST",
      path: `${prefix}${p.preview}`,
      handler: STUB,
      summary: "Preview formatted number without increment",
      tags: tag,
    },
  ];
}

/** OpenAPI 3.1 fragment for format CRUD + preview routes. */
export function docNumberFormatOpenApiDocument(
  basePath = "/doc-number",
  options: OpenApiEmitOptions & { paths?: DocNumberFormatOpenApiPaths } = {},
): OpenApiDocument {
  const { paths, title, version } = options;
  return toOpenApiDocument(docNumberFormatOpenApiRoutes(basePath, paths), {
    title: title ?? "Document number formats",
    version: version ?? "0.0.0",
  });
}
