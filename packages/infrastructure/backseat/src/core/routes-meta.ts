import type { HttpMethod, RouteDefinition } from "./types.js";

/** Serializable route metadata for Horizon B derivation (no handler closures). */
export type RegisteredRouteMeta = {
  method: HttpMethod;
  /** Path relative to Backseat `baseUrl` (e.g. `/jobs/:id`). */
  path: string;
  /** Full mount path: `` `${baseUrl}${path}` `` with normalized slashes. */
  fullPath: string;
  name?: string;
  collection?: string;
};

export function joinApiPath(baseUrl: string, routePath: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return `${base}${path}` || "/";
}

/** Strip non-serializable handlers from `RouteDefinition[]`. */
export function listRoutesMeta(
  routes: RouteDefinition[],
  baseUrl: string,
): RegisteredRouteMeta[] {
  return routes.map(({ method, path, name, collection }) => ({
    method,
    path,
    fullPath: joinApiPath(baseUrl, path),
    ...(name ? { name } : {}),
    ...(collection ? { collection } : {}),
  }));
}

export type RegisteredActionMeta = {
  name: string;
};

export type RoutesSnapshot = {
  generatedAt: string;
  baseUrl: string;
  routes: RegisteredRouteMeta[];
  actions: RegisteredActionMeta[];
};

/** Build a JSON-serializable route inventory for Express derivation. */
export function buildRoutesSnapshot(
  routes: RouteDefinition[],
  baseUrl: string,
  actions: Record<string, unknown>,
): RoutesSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routes: listRoutesMeta(routes, baseUrl),
    actions: Object.keys(actions)
      .sort()
      .map((name) => ({ name })),
  };
}

/** Pretty-print snapshot for devtools export or file write (app-owned I/O). */
export function formatRoutesSnapshot(snapshot: RoutesSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
