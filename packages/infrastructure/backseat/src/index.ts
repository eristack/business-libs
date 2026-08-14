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
  toBackseatErrorResponse,
} from "./core/errors.js";
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
} from "./core/types.js";

/** @deprecated Use createBackseat — kept for transitional imports. */
export const BACKSEAT_PACKAGE = "@eristack/backseat" as const;
