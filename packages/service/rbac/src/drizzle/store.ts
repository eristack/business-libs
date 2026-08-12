import { and, eq } from "drizzle-orm";
import type { RbacStore, RoleDef } from "../core/types.js";
import type { RbacTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (...args: any[]) => any;
};

/**
 * Drizzle-backed RbacStore. Pass tables from `createRbacTables("pgsql")`.
 * App owns migrations and the users table; these rows hang off `subject`.
 */
export function createDrizzleRbacStore(options: {
  db: Db;
  tables: RbacTables;
}): RbacStore {
  const { db, tables: t } = options;

  return {
    async listPermissions() {
      const rows = await db.select().from(t.permissions);
      return rows.map(
        (row: { name: string; description: string | null }) => ({
          name: row.name,
          description: row.description ?? undefined,
        }),
      );
    },

    async upsertPermission(def) {
      await db.delete(t.permissions).where(eq(t.permissions.name, def.name));
      await db.insert(t.permissions).values({
        name: def.name,
        description: def.description ?? null,
      });
    },

    async listRoles() {
      const roleRows = await db.select().from(t.roles);
      const linkRows = await db.select().from(t.rolePermissions);
      const byRole = new Map<string, string[]>();
      for (const link of linkRows as { role: string; permission: string }[]) {
        const list = byRole.get(link.role) ?? [];
        list.push(link.permission);
        byRole.set(link.role, list);
      }
      return (roleRows as { name: string; description: string | null }[]).map(
        (row) => ({
          name: row.name,
          description: row.description ?? undefined,
          permissions: byRole.get(row.name) ?? [],
        }),
      );
    },

    async upsertRole(def: RoleDef) {
      await db.delete(t.rolePermissions).where(eq(t.rolePermissions.role, def.name));
      await db.delete(t.roles).where(eq(t.roles.name, def.name));
      await db.insert(t.roles).values({
        name: def.name,
        description: def.description ?? null,
      });
      if (def.permissions.length) {
        await db.insert(t.rolePermissions).values(
          def.permissions.map((permission) => ({
            role: def.name,
            permission,
          })),
        );
      }
    },

    async deleteRole(name) {
      await db.delete(t.rolePermissions).where(eq(t.rolePermissions.role, name));
      await db.delete(t.subjectRoles).where(eq(t.subjectRoles.role, name));
      await db.delete(t.roles).where(eq(t.roles.name, name));
    },

    async getRole(name) {
      const roleRows = await db
        .select()
        .from(t.roles)
        .where(eq(t.roles.name, name));
      const role = roleRows[0] as
        | { name: string; description: string | null }
        | undefined;
      if (!role) return null;
      const links = await db
        .select()
        .from(t.rolePermissions)
        .where(eq(t.rolePermissions.role, name));
      return {
        name: role.name,
        description: role.description ?? undefined,
        permissions: (links as { permission: string }[]).map((l) => l.permission),
      };
    },

    async listSubjectRoles(subject) {
      const rows = await db
        .select()
        .from(t.subjectRoles)
        .where(eq(t.subjectRoles.subject, subject));
      return (rows as { role: string }[]).map((r) => r.role);
    },

    async assignRole(subject, role) {
      const existing = await db
        .select()
        .from(t.subjectRoles)
        .where(
          and(
            eq(t.subjectRoles.subject, subject),
            eq(t.subjectRoles.role, role),
          ),
        );
      if (existing.length) return;
      await db.insert(t.subjectRoles).values({ subject, role });
    },

    async revokeRole(subject, role) {
      await db
        .delete(t.subjectRoles)
        .where(
          and(
            eq(t.subjectRoles.subject, subject),
            eq(t.subjectRoles.role, role),
          ),
        );
    },

    async listSubjectPermissions(subject) {
      const rows = await db
        .select()
        .from(t.subjectPermissions)
        .where(eq(t.subjectPermissions.subject, subject));
      return (rows as { permission: string }[]).map((r) => r.permission);
    },

    async grantPermission(subject, permission) {
      const existing = await db
        .select()
        .from(t.subjectPermissions)
        .where(
          and(
            eq(t.subjectPermissions.subject, subject),
            eq(t.subjectPermissions.permission, permission),
          ),
        );
      if (existing.length) return;
      await db.insert(t.subjectPermissions).values({ subject, permission });
    },

    async revokePermission(subject, permission) {
      await db
        .delete(t.subjectPermissions)
        .where(
          and(
            eq(t.subjectPermissions.subject, subject),
            eq(t.subjectPermissions.permission, permission),
          ),
        );
    },
  };
}
