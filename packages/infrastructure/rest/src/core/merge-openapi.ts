import type { OpenApiDocument } from "./types.js";

/** Shallow-merge OpenAPI path maps (later docs win on path/method collisions). */
export function mergeOpenApiDocuments(
  ...documents: readonly OpenApiDocument[]
): OpenApiDocument {
  if (documents.length === 0) {
    return {
      openapi: "3.1.0",
      info: { title: "API", version: "0.0.0" },
      paths: {},
    };
  }

  const [first, ...rest] = documents;
  const paths: OpenApiDocument["paths"] = { ...first.paths };

  for (const doc of rest) {
    for (const [path, item] of Object.entries(doc.paths)) {
      paths[path] = { ...paths[path], ...item };
    }
  }

  return {
    openapi: "3.1.0",
    info: first.info,
    paths,
  };
}
