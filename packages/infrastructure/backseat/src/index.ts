export { createBackseat } from "./core/create-backseat.js";
export { createMemoryBackseatStore } from "./core/memory-store.js";
export {
  createHandlerContext,
  parseJsonBody,
  queryParam,
  queryParams,
} from "./core/context.js";
export {
  BackseatConflictError,
  BackseatError,
  BackseatNotFoundError,
  BackseatValidationError,
  BackseatVersionConflictError,
  toBackseatErrorResponse,
} from "./core/errors.js";
export {
  BackseatErrorCodes,
  jsonError,
  versionConflict,
} from "./core/json-error.js";
export type { JsonErrorBody, JsonErrorInput } from "./core/json-error.js";
export {
  buildRoutesSnapshot,
  formatRoutesSnapshot,
  joinApiPath,
  listRoutesMeta,
} from "./core/routes-meta.js";
export type {
  RegisteredActionMeta,
  RegisteredRouteMeta,
  RoutesSnapshot,
} from "./core/routes-meta.js";
export { applyCollectionFilter, parseListFilter } from "./core/filter.js";
export { createCrudHandlers, createCrudRouteHandlers } from "./core/handlers/crud.js";
export { BackseatRouter, normalizeApiPath } from "./core/router.js";

export type {
  Backseat,
  BackseatActionContext,
  BackseatActionHandler,
  BackseatCollectionFilter,
  BackseatCollectionOptions,
  BackseatDocument,
  BackseatErrorBody,
  BackseatHandler,
  BackseatHandlerContext,
  BackseatRequest,
  BackseatResponse,
  BackseatSeedSource,
  BackseatSnapshot,
  BackseatStore,
  CreateBackseatOptions,
  CrudHandlers,
  HttpMethod,
  RouteDefinition,
  RegisteredRouteMeta,
  RoutesSnapshot,
  TransactionalStore,
} from "./core/types.js";

/** @deprecated Use createBackseat — kept for transitional imports. */
export const BACKSEAT_PACKAGE = "@eristack/backseat" as const;
