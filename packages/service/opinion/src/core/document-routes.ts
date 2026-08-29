import { createRestRouter } from "@eristack/rest";
import type { RestHandler, RestRouteDef, RestRouter } from "@eristack/rest";

export type DocumentRouteRole =
  | "options"
  | "list"
  | "read"
  | "create"
  | "replace"
  | "transition"
  | "delete";

export type DocumentRouteSpec = {
  method: RestRouteDef["method"];
  /** Suffix after base path, e.g. `/options`, `/:id/:action`. */
  suffix: string;
  role: DocumentRouteRole;
  summary: string;
};

/** Canonical ERP document/master REST shape (Horizon A). */
export const DOCUMENT_ROUTE_SPECS: readonly DocumentRouteSpec[] = [
  {
    method: "GET",
    suffix: "/options",
    role: "options",
    summary: "Field metadata, enums, default sort",
  },
  {
    method: "GET",
    suffix: "/data-grid",
    role: "list",
    summary: "List envelope { items, pageInfo, query }",
  },
  {
    method: "GET",
    suffix: "/:id",
    role: "read",
    summary: "Read single document or master row",
  },
  {
    method: "POST",
    suffix: "/",
    role: "create",
    summary: "Create draft/default status",
  },
  {
    method: "PUT",
    suffix: "/:id",
    role: "replace",
    summary: "Full replace (versioned, rare)",
  },
  {
    method: "PATCH",
    suffix: "/:id/:action",
    role: "transition",
    summary: "Status transition or line patch command",
  },
  {
    method: "DELETE",
    suffix: "/:id",
    role: "delete",
    summary: "Soft-delete or cancel when policy allows",
  },
] as const;

export type DocumentRouteHandlers = Partial<
  Record<DocumentRouteRole, RestHandler>
>;

export type CreateDocumentRoutesOptions = {
  /** Resource prefix without trailing slash, e.g. `/invoices`. */
  basePath: string;
  handlers: DocumentRouteHandlers;
  tags?: string[];
};

function joinPath(base: string, suffix: string): string {
  if (suffix === "/") return base.replace(/\/$/, "") || "/";
  const normalized = base.replace(/\/$/, "");
  return `${normalized}${suffix}`;
}

/** Build declarative routes for the opinionated document REST map. */
export function createDocumentRoutes(
  options: CreateDocumentRoutesOptions,
): RestRouteDef[] {
  const routes: RestRouteDef[] = [];
  for (const spec of DOCUMENT_ROUTE_SPECS) {
    const handler = options.handlers[spec.role];
    if (!handler) continue;
    routes.push({
      method: spec.method,
      path: joinPath(options.basePath, spec.suffix),
      handler,
      summary: spec.summary,
      tags: options.tags,
    });
  }
  return routes;
}

export type CreateOpinionRouterOptions = {
  routes: RestRouteDef[];
};

/** Create a dispatchable REST router from opinion route defs. */
export function createOpinionRouter(
  options: CreateOpinionRouterOptions,
): RestRouter {
  return createRestRouter(options.routes);
}
