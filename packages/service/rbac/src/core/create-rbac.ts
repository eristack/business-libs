import {
  ForbiddenError,
  PermissionNotFoundError,
  RoleNotFoundError,
} from "./errors.js";
import type {
  PermissionName,
  Rbac,
  RbacConfig,
  RoleName,
  SubjectId,
} from "./types.js";

export function createRbac(config: RbacConfig): Rbac {
  const store = config.store;
  const unknownDenied = config.unknownPermissionDenied ?? true;

  async function assertPermissionKnown(permission: PermissionName) {
    const all = await store.listPermissions();
    if (!all.some((p) => p.name === permission)) {
      throw new PermissionNotFoundError(permission);
    }
  }

  async function permissionsFor(subject: SubjectId): Promise<Set<PermissionName>> {
    const roleNames = await store.listSubjectRoles(subject);
    const direct = await store.listSubjectPermissions(subject);
    const set = new Set<PermissionName>(direct);
    for (const roleName of roleNames) {
      const role = await store.getRole(roleName);
      if (!role) continue;
      for (const p of role.permissions) set.add(p);
    }
    return set;
  }

  async function can(
    subject: SubjectId,
    permission: PermissionName,
  ): Promise<boolean> {
    const known = await store.listPermissions();
    if (!known.some((p) => p.name === permission)) {
      if (unknownDenied) return false;
      throw new PermissionNotFoundError(permission);
    }
    const effective = await permissionsFor(subject);
    return effective.has(permission);
  }

  return {
    async definePermission(def) {
      const name = def.name.trim();
      if (!name) throw new RbacConfigError("Permission name is required");
      await store.upsertPermission({ ...def, name });
    },

    async defineRole(def) {
      const name = def.name.trim();
      if (!name) throw new RbacConfigError("Role name is required");
      for (const permission of def.permissions) {
        await assertPermissionKnown(permission);
      }
      await store.upsertRole({
        ...def,
        name,
        permissions: [...new Set(def.permissions)],
      });
    },

    async assignRole({ subject, role }) {
      const found = await store.getRole(role);
      if (!found) throw new RoleNotFoundError(role);
      await store.assignRole(subject, role);
    },

    async revokeRole({ subject, role }) {
      await store.revokeRole(subject, role);
    },

    async grantPermission({ subject, permission }) {
      await assertPermissionKnown(permission);
      await store.grantPermission(subject, permission);
    },

    async revokePermission({ subject, permission }) {
      await store.revokePermission(subject, permission);
    },

    permissionsFor,
    rolesFor: (subject) => store.listSubjectRoles(subject),
    can,

    async canAny(subject, permissions) {
      for (const permission of permissions) {
        if (await can(subject, permission)) return true;
      }
      return false;
    },

    async canAll(subject, permissions) {
      for (const permission of permissions) {
        if (!(await can(subject, permission))) return false;
      }
      return true;
    },

    async authorize(subject, permission) {
      if (!(await can(subject, permission))) {
        throw new ForbiddenError(permission, subject);
      }
    },
  };
}

class RbacConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RbacConfigError";
  }
}

export type { RoleName, SubjectId, PermissionName };
