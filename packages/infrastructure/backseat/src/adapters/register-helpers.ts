import type {
  Backseat,
  BackseatHandlerContext,
  BackseatResponse,
  HttpMethod,
} from "../core/types.js";
import {
  BackseatErrorCodes,
  jsonError,
  type JsonErrorBody,
} from "../core/json-error.js";

/** Normalize mount prefix: trim, ensure leading `/`, strip trailing `/`. */
export function normalizeBasePath(basePath?: string, fallback = ""): string {
  const raw = (basePath ?? fallback).trim();
  if (!raw) return "";
  return raw.startsWith("/") ? raw.replace(/\/$/, "") : `/${raw}`.replace(/\/$/, "");
}

/** Join base mount + route segment (doc-number / jwt-auth style). */
export function joinRoutePath(base: string, segment: string): string {
  const left = base.replace(/\/$/, "");
  const right = segment.startsWith("/") ? segment : `/${segment}`;
  const joined = `${left}${right}`;
  return joined || "/";
}

export function validationError(
  message: string,
  details?: Record<string, unknown>,
): BackseatResponse<JsonErrorBody> {
  return jsonError({
    status: 400,
    code: BackseatErrorCodes.VALIDATION_ERROR,
    message,
    details,
  });
}

export function policyDenied(
  message: string,
  details?: Record<string, unknown>,
): BackseatResponse<JsonErrorBody> {
  return jsonError({
    status: 409,
    code: BackseatErrorCodes.POLICY_DENIED,
    message,
    details,
  });
}

/** Return error response when value missing — does not throw. */
export function requireParam<T>(
  value: T | undefined | null,
  message: string,
): T | BackseatResponse<JsonErrorBody> {
  if (value === undefined || value === null || value === "") {
    return validationError(message);
  }
  return value;
}

export function registerMountedRoutes(
  api: Backseat,
  basePath: string,
  routes: Array<{
    method: HttpMethod;
    segment: string;
    name?: string;
    handler: (
      ctx: BackseatHandlerContext,
    ) => Promise<BackseatResponse> | BackseatResponse;
  }>,
): void {
  const base = normalizeBasePath(basePath);
  for (const route of routes) {
    api.registerRoute({
      method: route.method,
      path: joinRoutePath(base, route.segment),
      name: route.name,
      handler: async (ctx) => route.handler(ctx),
    });
  }
}

export { jsonError, versionConflict, BackseatErrorCodes } from "../core/json-error.js";
