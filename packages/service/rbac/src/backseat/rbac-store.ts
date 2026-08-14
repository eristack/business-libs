import type { BackseatStore } from "@eristack/backseat";
import type {
  PermissionDef,
  RbacStore,
  RoleDef,
} from "../core/types.js";
import {
  RBAC_COLLECTIONS,
  subjectPermissionId,
  subjectRoleId,
} from "./collections.js";

export function createBackseatRbacStore(
  store: BackseatStore,
  collections: Partial<typeof RBAC_COLLECTIONS> = {},
): RbacStore {
  const cols = { ...RBAC_COLLECTIONS, ...collections };

  return {
    async listPermissions() {
      const docs = await store.list(cols.permissions);
      return docs
        .map(
          (doc): PermissionDef => ({
            name: String(doc.name),
            description:
              doc.description == null ? undefined : String(doc.description),
          }),
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async upsertPermission(def) {
      const id = def.name;
      const doc = {
        id,
        name: def.name,
        description: def.description ?? null,
      };
      const existing = await store.get(cols.permissions, id);
      if (existing) {
        await store.update(cols.permissions, id, doc);
        return;
      }
      await store.create(cols.permissions, doc);
    },

    async listRoles() {
      const docs = await store.list(cols.roles);
      return docs.map((doc) => ({
        name: String(doc.name),
        description:
          doc.description == null ? undefined : String(doc.description),
        permissions: Array.isArray(doc.permissions)
          ? doc.permissions.map(String)
          : [],
      }));
    },

    async upsertRole(def: RoleDef) {
      const doc = {
        id: def.name,
        name: def.name,
        description: def.description ?? null,
        permissions: [...def.permissions],
      };
      const existing = await store.get(cols.roles, def.name);
      if (existing) {
        await store.update(cols.roles, def.name, doc);
        return;
      }
      await store.create(cols.roles, doc);
    },

    async deleteRole(name) {
      await store.delete(cols.roles, name);
      const roleLinks = await store.list(cols.subjectRoles, { where: { role: name } });
      for (const link of roleLinks) {
        if (link.id) await store.delete(cols.subjectRoles, String(link.id));
      }
    },

    async getRole(name) {
      const doc = await store.get(cols.roles, name);
      if (!doc) return null;
      return {
        name: String(doc.name),
        description:
          doc.description == null ? undefined : String(doc.description),
        permissions: Array.isArray(doc.permissions)
          ? doc.permissions.map(String)
          : [],
      };
    },

    async listSubjectRoles(subject) {
      const docs = await store.list(cols.subjectRoles, { where: { subject } });
      return docs.map((doc) => String(doc.role)).sort();
    },

    async assignRole(subject, role) {
      const id = subjectRoleId(subject, role);
      const doc = { id, subject, role };
      const existing = await store.get(cols.subjectRoles, id);
      if (existing) return;
      await store.create(cols.subjectRoles, doc);
    },

    async revokeRole(subject, role) {
      const id = subjectRoleId(subject, role);
      const existing = await store.get(cols.subjectRoles, id);
      if (existing) await store.delete(cols.subjectRoles, id);
    },

    async listSubjectPermissions(subject) {
      const docs = await store.list(cols.subjectPermissions, {
        where: { subject },
      });
      return docs.map((doc) => String(doc.permission)).sort();
    },

    async grantPermission(subject, permission) {
      const id = subjectPermissionId(subject, permission);
      const doc = { id, subject, permission };
      const existing = await store.get(cols.subjectPermissions, id);
      if (existing) return;
      await store.create(cols.subjectPermissions, doc);
    },

    async revokePermission(subject, permission) {
      const id = subjectPermissionId(subject, permission);
      const existing = await store.get(cols.subjectPermissions, id);
      if (existing) await store.delete(cols.subjectPermissions, id);
    },
  };
}
