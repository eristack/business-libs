export { createRbac } from "./core/create-rbac.js";
/** @deprecated Import from `@eristack/rbac/testing` instead. */
export { createMemoryRbacStore } from "./core/memory-store.js";
export {
  ForbiddenError,
  PermissionNotFoundError,
  RbacError,
  RoleNotFoundError,
} from "./core/errors.js";
export type {
  PermissionDef,
  PermissionName,
  Rbac,
  RbacConfig,
  RbacStore,
  RoleDef,
  RoleName,
  SubjectId,
} from "./core/types.js";
