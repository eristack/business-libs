import type {
  PermissionDef,
  PermissionName,
  RbacStore,
  RoleDef,
  RoleName,
  SubjectId,
} from "./types.js";

/** In-memory store for tests and ephemeral apps. */
export function createMemoryRbacStore(): RbacStore {
  const permissions = new Map<PermissionName, PermissionDef>();
  const roles = new Map<RoleName, RoleDef>();
  const subjectRoles = new Map<SubjectId, Set<RoleName>>();
  const subjectPermissions = new Map<SubjectId, Set<PermissionName>>();

  return {
    async listPermissions() {
      return [...permissions.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },
    async upsertPermission(def) {
      permissions.set(def.name, { ...def });
    },
    async listRoles() {
      return [...roles.values()].map((r) => ({
        ...r,
        permissions: [...r.permissions],
      }));
    },
    async upsertRole(def) {
      roles.set(def.name, {
        ...def,
        permissions: [...def.permissions],
      });
    },
    async deleteRole(name) {
      roles.delete(name);
      for (const set of subjectRoles.values()) set.delete(name);
    },
    async getRole(name) {
      const role = roles.get(name);
      return role
        ? { ...role, permissions: [...role.permissions] }
        : null;
    },
    async listSubjectRoles(subject) {
      return [...(subjectRoles.get(subject) ?? [])].sort();
    },
    async assignRole(subject, role) {
      const set = subjectRoles.get(subject) ?? new Set();
      set.add(role);
      subjectRoles.set(subject, set);
    },
    async revokeRole(subject, role) {
      subjectRoles.get(subject)?.delete(role);
    },
    async listSubjectPermissions(subject) {
      return [...(subjectPermissions.get(subject) ?? [])].sort();
    },
    async grantPermission(subject, permission) {
      const set = subjectPermissions.get(subject) ?? new Set();
      set.add(permission);
      subjectPermissions.set(subject, set);
    },
    async revokePermission(subject, permission) {
      subjectPermissions.get(subject)?.delete(permission);
    },
  };
}
