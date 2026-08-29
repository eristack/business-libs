import type { PermissionName, RoleName } from "./types.js";

export type RoleInheritanceGraph = Record<
  RoleName,
  {
    permissions: PermissionName[];
    /** Parent roles whose permissions are included transitively. */
    inherits?: readonly RoleName[];
  }
>;

export class RoleCycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleCycleError";
  }
}

/** Expand assigned roles + inherited parents into a flat permission set. */
export function expandRolePermissions(
  graph: RoleInheritanceGraph,
  assignedRoles: readonly RoleName[],
): Set<PermissionName> {
  const permissions = new Set<PermissionName>();
  const visiting = new Set<RoleName>();

  function visit(role: RoleName): void {
    if (visiting.has(role)) {
      throw new RoleCycleError(`role inheritance cycle at "${role}"`);
    }
    const def = graph[role];
    if (!def) return;
    visiting.add(role);
    for (const permission of def.permissions) {
      permissions.add(permission);
    }
    for (const parent of def.inherits ?? []) {
      visit(parent);
    }
    visiting.delete(role);
  }

  for (const role of assignedRoles) {
    visit(role);
  }
  return permissions;
}
